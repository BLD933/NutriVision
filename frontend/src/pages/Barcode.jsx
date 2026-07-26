import { useState } from "react";
import { ScanBarcode, Search, Package, AlertTriangle } from "lucide-react";

const MOCK_PRODUCTS = {
  "6120000000011": { name: "Coca-Cola 33cl", brand: "Coca-Cola", cals: 139, sugar: 35, sodium: 0.01, tags: ["Sucré", "Sodium élevé"] },
  "3017620422003": { name: "Nutella 400g", brand: "Ferrero", cals: 539, sugar: 56, sodium: 0.08, tags: ["Très sucré", "Richesse en graisses"] },
  "5449000000996": { name: "Coca-Cola Zero 33cl", brand: "Coca-Cola", cals: 0, sugar: 0, sodium: 0.01, tags: ["Zéro calories", "Sans sucre"] },
  "8000500310427": { name: "Fanta Orange 33cl", brand: "Coca-Cola", cals: 133, sugar: 30, sodium: 0.01, tags: ["Sucré"] },
};

export default function Barcode() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  function search() { if (!code.trim()) return; setResult(MOCK_PRODUCTS[code.trim()] || null); }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><ScanBarcode className="w-5 h-5 text-gold-600" /> Scanner un code-barres</h3>
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Entrez un code-barres" className="input-field pl-10" />
            </div>
            <button onClick={search} className="btn-primary">Rechercher</button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Démo : 6120000000011, 3017620422003, 5449000000996, 8000500310427</p>
        </div>
      </div>
      {code && (
        <div className="card">
          {result ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-gold-600" /> Produit trouvé</h3></div>
              <div className="p-6">
                <div className="mb-4"><p className="text-lg font-bold text-gray-900">{result.name}</p><p className="text-sm text-gray-500">{result.brand}</p></div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-gold-50 rounded-xl text-center"><p className="text-xl font-bold text-gold-700">{result.cals}</p><p className="text-xs text-gold-500">kcal/100g</p></div>
                  <div className="p-3 bg-amber-50 rounded-xl text-center"><p className="text-xl font-bold text-amber-700">{result.sugar}g</p><p className="text-xs text-amber-500">Sucres</p></div>
                  <div className="p-3 bg-purple-50 rounded-xl text-center"><p className="text-xl font-bold text-purple-700">{(result.sodium * 1000).toFixed(0)}mg</p><p className="text-xs text-purple-500">Sodium</p></div>
                </div>
                <div className="flex flex-wrap gap-2">{result.tags.map((t, i) => <span key={i} className="px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-medium">{t}</span>)}</div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-400"><AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">Produit non trouvé</p></div>
          )}
        </div>
      )}
    </div>
  );
}
