import React, { useState } from 'react';
import {
  Sparkles, Ruler, Sliders, Minus, Plus, CreditCard, AlertCircle
} from 'lucide-react';

// სტანდარტული ზომების საერთაშორისო ცხრილი (ISO 8653)
export const SIZE_CHART = [
  { eu: '15.0', diameter: 15.0, circumference: 47.1, us: '4' },
  { eu: '15.5', diameter: 15.5, circumference: 48.7, us: '4.5-5' },
  { eu: '16.0', diameter: 16.0, circumference: 50.3, us: '5.5' },
  { eu: '16.5', diameter: 16.5, circumference: 51.8, us: '6' },
  { eu: '17.0', diameter: 17.0, circumference: 53.4, us: '6.5' },
  { eu: '17.5', diameter: 17.5, circumference: 55.0, us: '7' },
  { eu: '18.0', diameter: 18.0, circumference: 56.5, us: '7.5-8' },
  { eu: '18.5', diameter: 18.5, circumference: 58.1, us: '8.5' },
  { eu: '19.0', diameter: 19.0, circumference: 59.7, us: '9' },
  { eu: '19.5', diameter: 19.5, circumference: 61.3, us: '9.5' },
  { eu: '20.0', diameter: 20.0, circumference: 62.8, us: '10' },
  { eu: '20.5', diameter: 20.5, circumference: 64.4, us: '10.5' },
  { eu: '21.0', diameter: 21.0, circumference: 66.0, us: '11' },
  { eu: '21.5', diameter: 21.5, circumference: 67.5, us: '11.5' },
  { eu: '22.0', diameter: 22.0, circumference: 69.1, us: '12' }
];

export const getClosestSize = (d) => {
  let closest = SIZE_CHART[0];
  let minDiff = Math.abs(d - SIZE_CHART[0].diameter);
  for (const item of SIZE_CHART) {
    const diff = Math.abs(d - item.diameter);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }
  return closest;
};

export default function RingSizerTool({
  onSizeChange,
  showNotice = true,
  darkMode = true,
  lang = 'ka'
}) {
  const [activeTab, setActiveTab] = useState('ring'); // 'ring' | 'finger' | 'table'
  const [diameter, setDiameter] = useState(16.5);
  const [pxPerMm, setPxPerMm] = useState(3.78);
  const [showCalibration, setShowCalibration] = useState(false);
  const [cardWidthPx, setCardWidthPx] = useState(323.5);
  const [fingerCircumference, setFingerCircumference] = useState(52);

  const closest = getClosestSize(diameter);
  const fingerDiameter = fingerCircumference > 0 ? fingerCircumference / Math.PI : 16.5;
  const closestFingerSize = getClosestSize(fingerDiameter);

  const currentMatchedSize = activeTab === 'finger' ? closestFingerSize.eu : closest.eu;

  const handleCardSlider = (newWidthPx) => {
    setCardWidthPx(newWidthPx);
    const newPxPerMm = newWidthPx / 85.60;
    setPxPerMm(newPxPerMm);
  };

  const handleDiameterChange = (newDiameter) => {
    setDiameter(newDiameter);
    if (onSizeChange) {
      const match = getClosestSize(newDiameter);
      onSizeChange(match.eu, newDiameter);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-stone-500/10 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('ring')}
          className={`py-2 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'ring'
              ? 'bg-amber-500 text-black font-semibold shadow-md'
              : 'opacity-75 hover:opacity-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'ka' ? 'ბეჭდით' : 'With Ring'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('finger')}
          className={`py-2 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'finger'
              ? 'bg-amber-500 text-black font-semibold shadow-md'
              : 'opacity-75 hover:opacity-100'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>{lang === 'ka' ? 'თითით' : 'Finger'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`py-2 px-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'table'
              ? 'bg-amber-500 text-black font-semibold shadow-md'
              : 'opacity-75 hover:opacity-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{lang === 'ka' ? 'ცხრილი' : 'Chart'}</span>
        </button>
      </div>

      {/* Tab 1: ბეჭდის დადება ეკრანზე */}
      {activeTab === 'ring' && (
        <div className="space-y-5">
          <div className="text-center space-y-1">
            <p className="text-xs font-medium opacity-75">
              {lang === 'ka'
                ? 'დაადეთ თქვენი ბეჭედი ეკრანის წრეს და მოარგეთ შიდა კიდე'
                : 'Place your ring on the circle and match the inner edge'}
            </p>
          </div>

          {/* ინტერაქტიული ოქროსფერი წრე */}
          <div className="relative flex items-center justify-center py-6 min-h-[220px]">
            <div
              className="rounded-full border-2 border-amber-500 flex items-center justify-center transition-all duration-75 relative"
              style={{
                width: `${diameter * pxPerMm}px`,
                height: `${diameter * pxPerMm}px`,
                boxShadow:
                  '0 0 35px rgba(245, 158, 11, 0.25), inset 0 0 15px rgba(245, 158, 11, 0.15)'
              }}
            >
              <div className="absolute inset-1 rounded-full border border-dashed border-amber-500/40 pointer-events-none" />
              <div className="text-center px-2 pointer-events-none select-none">
                <span className="font-serif font-bold text-amber-500 text-lg sm:text-xl block leading-none">
                  {closest.eu}
                </span>
                <span className="text-[10px] uppercase tracking-wider opacity-60 block mt-0.5">
                  {diameter.toFixed(1)} მმ
                </span>
              </div>
            </div>
          </div>

          {/* ინფორმაციის ბლოკი */}
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-2xl bg-stone-500/10 border border-stone-500/15">
            <div>
              <span className="text-[10px] uppercase tracking-wider opacity-60 block">
                {lang === 'ka' ? 'ზომა (ქართ/EU)' : 'Size (EU)'}
              </span>
              <span className="text-base font-bold text-amber-500 font-serif">{closest.eu}</span>
            </div>
            <div className="border-x border-stone-500/20">
              <span className="text-[10px] uppercase tracking-wider opacity-60 block">
                {lang === 'ka' ? 'შიდა დიამეტრი' : 'Diameter'}
              </span>
              <span className="text-sm font-semibold">{diameter.toFixed(1)} მმ</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider opacity-60 block">
                {lang === 'ka' ? 'აშშ (US)' : 'US Size'}
              </span>
              <span className="text-sm font-semibold">US {closest.us}</span>
            </div>
          </div>

          {/* სლაიდერი და +/- ღილაკები */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDiameterChange(Math.max(14.0, Number((diameter - 0.1).toFixed(1))))}
                className="w-9 h-9 rounded-full border border-stone-500/25 flex items-center justify-center hover:border-amber-500/50 hover:bg-stone-500/10 transition-colors"
                aria-label="ზომის შემცირება"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="14.0"
                max="22.0"
                step="0.1"
                value={diameter}
                onChange={(e) => handleDiameterChange(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer h-2 bg-stone-500/20 rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleDiameterChange(Math.min(22.0, Number((diameter + 0.1).toFixed(1))))}
                className="w-9 h-9 rounded-full border border-stone-500/25 flex items-center justify-center hover:border-amber-500/50 hover:bg-stone-500/10 transition-colors"
                aria-label="ზომის გაზრდა"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* სწრაფი ღილაკები პოპულარულ ზომებზე */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[11px]">
              {['16.0', '16.5', '17.0', '17.5', '18.0', '18.5'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleDiameterChange(parseFloat(sz))}
                  className={`px-2.5 py-1 rounded-lg border transition-all ${
                    closest.eu === sz
                      ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                      : 'border-stone-500/20 opacity-70 hover:opacity-100 hover:border-amber-500/40'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* ეკრანის კალიბრაცია (საბანკო ბარათით) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowCalibration(!showCalibration)}
              className="w-full text-[11px] text-amber-500/90 hover:text-amber-500 flex items-center justify-center gap-1.5 transition-colors underline"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>
                {showCalibration
                  ? lang === 'ka'
                    ? 'კალიბრაციის დამალვა'
                    : 'Hide screen calibration'
                  : lang === 'ka'
                  ? 'ეკრანის კალიბრაცია ბარათით (მაქსიმალური სიზუსტისთვის)'
                  : 'Calibrate screen with ID/Credit Card'}
              </span>
            </button>

            {showCalibration && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2 text-xs animate-fadeIn">
                <p className="opacity-80 text-[11px]">
                  {lang === 'ka'
                    ? 'ნებისმიერი საბანკო ბარათის ან პირადობის სიგანე ზუსტად 85.6 მმ-ია. დაადეთ ბარათი ქვედა ჩარჩოს და გაასწორეთ სლაიდერი:'
                    : 'Standard cards are 85.6 mm wide. Match the card to the box below:'}
                </p>
                <div className="flex justify-center py-2">
                  <div
                    className="h-14 rounded-xl border-2 border-dashed border-amber-500 flex items-center justify-center text-[10px] text-amber-500 bg-amber-500/5"
                    style={{ width: `${cardWidthPx}px`, maxWidth: '100%' }}
                  >
                    💳 {lang === 'ka' ? 'ბარათის სიგანე (85.6 მმ)' : 'Card width (85.6 mm)'}
                  </div>
                </div>
                <input
                  type="range"
                  min="260"
                  max="420"
                  step="1"
                  value={cardWidthPx}
                  onChange={(e) => handleCardSlider(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-500/20 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: თითის გაზომვა ქაღალდის ზოლით */}
      {activeTab === 'finger' && (
        <div className="space-y-4">
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-500/10">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[11px] shrink-0">
                1
              </span>
              <p className="opacity-85">
                {lang === 'ka'
                  ? 'შემოიხვიეთ ვიწრო ქაღალდის ზოლი ან ძაფი სასურველ თითზე.'
                  : 'Wrap a narrow strip of paper or string around your finger.'}
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-500/10">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[11px] shrink-0">
                2
              </span>
              <p className="opacity-85">
                {lang === 'ka'
                  ? 'კალმით მონიშნეთ ადგილი, სადაც ზოლი ზუსტად იკვრება ერთმანეთზე.'
                  : 'Mark with a pen where the ends overlap.'}
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-500/10">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[11px] shrink-0">
                3
              </span>
              <p className="opacity-85">
                {lang === 'ka'
                  ? 'გაშალეთ ზოლი და გაზომეთ სახაზავით მილიმეტრებში (მაგ: 53 მმ).'
                  : 'Measure the strip with a ruler in millimeters (e.g. 53 mm).'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <label className="block text-xs font-medium text-amber-500">
              {lang === 'ka' ? 'შეიყვანეთ მიღებული სიგრძე (მმ):' : 'Enter circumference in mm:'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="40"
                max="75"
                step="0.5"
                value={fingerCircumference}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setFingerCircumference(val);
                  if (onSizeChange && val > 0) {
                    const d = val / Math.PI;
                    const match = getClosestSize(d);
                    onSizeChange(match.eu, d);
                  }
                }}
                className="w-24 px-3 py-2 rounded-xl border border-stone-500/30 bg-transparent text-center font-bold text-lg focus:border-amber-500 focus:outline-none"
              />
              <span className="text-xs opacity-60">მმ</span>
              <div className="flex-1 text-right">
                <span className="text-[10px] uppercase tracking-wider opacity-60 block">
                  {lang === 'ka' ? 'რეკომენდებული ზომა:' : 'Recommended Size:'}
                </span>
                <span className="text-xl font-bold font-serif text-amber-500">
                  ზომა {closestFingerSize.eu}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ზომების სრული ცხრილი */}
      {activeTab === 'table' && (
        <div className="space-y-3 max-h-72 overflow-y-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-500/20 text-[10px] uppercase tracking-wider opacity-60">
                <th className="py-2">{lang === 'ka' ? 'ზომა (EU)' : 'Size (EU)'}</th>
                <th className="py-2">{lang === 'ka' ? 'დიამეტრი' : 'Diameter'}</th>
                <th className="py-2">{lang === 'ka' ? 'გარშემოწერილობა' : 'Circumference'}</th>
                <th className="py-2">{lang === 'ka' ? 'აშშ (US)' : 'US'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-500/10">
              {SIZE_CHART.map((item) => {
                const isCurrent = closest.eu === item.eu;
                return (
                  <tr
                    key={item.eu}
                    onClick={() => handleDiameterChange(item.diameter)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/15 font-semibold text-amber-500'
                        : 'hover:bg-stone-500/5 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <td className="py-2 font-serif text-sm">{item.eu}</td>
                    <td className="py-2">{item.diameter.toFixed(1)} მმ</td>
                    <td className="py-2">{item.circumference.toFixed(1)} მმ</td>
                    <td className="py-2">US {item.us}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* შენიშვნა ცდომილების შესახებ */}
      {showNotice && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-500 block mb-0.5">
              {lang === 'ka' ? 'შენიშვნა ცდომილების შესახებ:' : 'Notice on Margin of Error:'}
            </span>
            <p className="text-[11px] opacity-80">
              {lang === 'ka'
                ? 'ეკრანის მოდელის, დამცავი ბრონის ან მოწყობილობის მასშტაბირების გამო შესაძლოა არსებობდეს მცირე (0.2–0.5 მმ) ცდომილების ალბათობა. თუ ორ ზომას შორის მერყეობთ, უმჯობესია აირჩიოთ ოდნავ დიდი ზომა, ან გაიაროთ უფასო ონლაინ კონსულტაცია ჩვენს სპეციალისტთან.'
                : 'Due to device screen scaling or protective glass, a slight margin of error (0.2–0.5 mm) may occur. If between sizes, choose the larger one or contact our specialist on WhatsApp.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
