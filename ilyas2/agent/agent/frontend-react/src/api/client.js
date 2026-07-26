const API_BASE = "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {},
    ...options,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(options.body);
  }

  if (options.token) {
    config.headers["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(url, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export async function healthCheck() {
  return request("/health");
}

export async function analyseMeal(imageFile, idToken) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await fetch(`${API_BASE}/analyse`, {
    method: "POST",
    headers: { Authorization: `Bearer ${idToken}` },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Analysis failed");
  }

  return data;
}

export async function sendChat({ message, nutritionCtx, userProfile, ragDocs }) {
  return request("/chat", {
    method: "POST",
    body: {
      message,
      nutrition_ctx: nutritionCtx || {},
      user_profile: userProfile || {},
      rag_docs: ragDocs || "",
    },
  });
}

export async function sendChatStream({ message, nutritionCtx, userProfile, ragDocs, onToken, onDone, onError }) {
  const body = JSON.stringify({
    message,
    nutrition_ctx: nutritionCtx || {},
    user_profile: userProfile || {},
    rag_docs: ragDocs || "",
  });

  try {
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError?.(new Error(data.error || `Request failed (${res.status})`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            onToken?.(parsed.token);
          } catch {
            // ignore partial JSON
          }
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err);
  }
}

export async function sendStream({ endpoint, body, onToken, onDone, onError }) {
  try {
    const res = await fetch(`/api${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError?.(new Error(data.error || `Request failed (${res.status})`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            onToken?.(parsed.token);
          } catch {
            // ignore partial JSON
          }
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err);
  }
}
