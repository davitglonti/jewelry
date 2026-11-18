import React, { useState, useEffect } from 'react';
import {
  Sparkles, Ruler, Sliders, Minus, Plus, CreditCard, Info
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
  externalDiameter,
  showNotice = true,
  lang = 'ka'
}) {
  const [activeTab, setActiveTab] = useState('ring'); // 'ring' | 'finger' | 'table'
  const [diameter, setDiameter] = useState(externalDiameter ?? 16.5);
  const [pxPerMm, setPxPerMm] = useState(3.78);
  const [showCalibration, setShowCalibration] = useState(false);
  const [cardWidthPx, setCardWidthPx] = useState(323.5);
  const [fingerCircumference, setFingerCircumference] = useState(52);

  useEffect(() => {
    if (typeof externalDiameter === 'number' && !Number.isNaN(externalDiameter)) {
      setDiameter(externalDiameter);
    }
  }, [externalDiameter]);

  const closest = getClosestSize(diameter);
  const fingerDiameter = fingerCircumference > 0 ? fingerCircumference / Math.PI : 16.5;
  const closestFingerSize = getClosestSize(fingerDiameter);

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
    <div className="space-y-6 text-[#2E2A25]">
      {/* Airy Pearl-White Segmented Pill Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-full bg-[#F7F3EC] border border-[#EFE9DF] text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('ring')}
          className={`py-2.5 px-3 rounded-full transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ring'
              ? 'bg-white text-[#7A5B2B] border border-[#E8DEC9] shadow-[0_2px_10px_rgba(31,28,24,0.06)]'
              : 'text-[#6E675E] hover:text-[#2E2A25] border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>{lang === 'ka' ? 'ბეჭდით' : 'With Ring'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('finger')}
          className={`py-2.5 px-3 rounded-full transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'finger'
              ? 'bg-white text-[#7A5B2B] border border-[#E8DEC9] shadow-[0_2px_10px_rgba(31,28,24,0.06)]'
              : 'text-[#6E675E] hover:text-[#2E2A25] border border-transparent'
          }`}
        >
          <Ruler className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>{lang === 'ka' ? 'თითით' : 'Finger'}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('table')}
          className={`py-2.5 px-3 rounded-full transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'table'
              ? 'bg-white text-[#7A5B2B] border border-[#E8DEC9] shadow-[0_2px_10px_rgba(31,28,24,0.06)]'
              : 'text-[#6E675E] hover:text-[#2E2A25] border border-transparent'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 stroke-[1.75]" />
          <span>{lang === 'ka' ? 'ცხრილი' : 'Chart'}</span>
        </button>
      </div>

      {/* Tab 1: ბეჭდის დადება ეკრანზე */}
      {activeTab === 'ring' && (
        <div className="space-y-5">
          <p className="text-center text-xs sm:text-sm text-[#6E675E]">
            {lang === 'ka'
              ? 'დაადეთ თქვენი ბეჭედი ეკრანის წრეს და მოარგეთ შიდა კიდე'
              : 'Place your ring on the circle and match the inner edge'}
          </p>

          {/* Luminous Ivory Ring Measurement Pad */}
          <div className="relative flex items-center justify-center py-8 min-h-[210px] rounded-2xl bg-[#FDFBF7] border border-[#EFE9DF] overflow-hidden">
            {/* Soft hairline center guides */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#EFE9DF] pointer-events-none" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-[#EFE9DF] pointer-events-none" />

            <div
              className="rounded-full border-2 border-[#B3925B] bg-white flex items-center justify-center transition-all duration-75 relative z-10"
              style={{
                width: `${diameter * pxPerMm}px`,
                height: `${diameter * pxPerMm}px`,
                boxShadow:
                  '0 0 0 7px rgba(179, 146, 91, 0.09), 0 8px 24px rgba(179, 146, 91, 0.14)'
              }}
            >
              <div className="absolute inset-1 rounded-full border border-dashed border-[#C9AF82]/60 pointer-events-none" />
              <div className="text-center px-1.5 pointer-events-none select-none">
                <span className="font-serif font-semibold text-[#2E2A25] text-base sm:text-lg block leading-none">
                  {closest.eu}
                </span>
                <span className="text-[10px] text-[#857D73] block mt-0.5 leading-none">
                  {diameter.toFixed(1)} მმ
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-3 text-center py-3.5 px-2 rounded-2xl bg-[#FCFBF8] border border-[#EFE9DF] divide-x divide-[#EFE9DF]">
            <div className="px-2">
              <span className="text-[11px] text-[#857D73] block mb-0.5">
                {lang === 'ka' ? 'ზომა (ქართ/EU)' : 'Size (EU)'}
              </span>
              <span className="text-lg font-semibold text-[#9A7742] font-serif">{closest.eu}</span>
            </div>
            <div className="px-2">
              <span className="text-[11px] text-[#857D73] block mb-0.5">
                {lang === 'ka' ? 'შიდა დიამეტრი' : 'Diameter'}
              </span>
              <span className="text-sm sm:text-base font-medium text-[#2E2A25]">{diameter.toFixed(1)} მმ</span>
            </div>
            <div className="px-2">
              <span className="text-[11px] text-[#857D73] block mb-0.5">
                {lang === 'ka' ? 'აშშ (US)' : 'US Size'}
              </span>
              <span className="text-sm sm:text-base font-medium text-[#2E2A25]">US {closest.us}</span>
            </div>
          </div>

          {/* Precision Slider & +/- Controls */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDiameterChange(Math.max(14.0, Number((diameter - 0.1).toFixed(1))))}
                className="w-9 h-9 rounded-full bg-white border border-[#E5DDD0] text-[#5C564E] flex items-center justify-center hover:border-[#B3925B] hover:text-[#7A5B2B] hover:bg-[#FDFBF7] transition-colors cursor-pointer shrink-0"
                aria-label="ზომის შემცირება"
              >
                <Minus className="w-4 h-4 stroke-[1.75]" />
              </button>
              <input
                type="range"
                min="14.0"
                max="22.0"
                step="0.1"
                value={diameter}
                onChange={(e) => handleDiameterChange(parseFloat(e.target.value))}
                className="flex-1 accent-[#B3925B] cursor-pointer h-1.5 bg-[#EDE6DA] rounded-full"
              />
              <button
                type="button"
                onClick={() => handleDiameterChange(Math.min(22.0, Number((diameter + 0.1).toFixed(1))))}
                className="w-9 h-9 rounded-full bg-white border border-[#E5DDD0] text-[#5C564E] flex items-center justify-center hover:border-[#B3925B] hover:text-[#7A5B2B] hover:bg-[#FDFBF7] transition-colors cursor-pointer shrink-0"
                aria-label="ზომის გაზრდა"
              >
                <Plus className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>

            {/* Quick Size Selector Pills */}
            <div className="grid grid-cols-6 gap-2 text-xs">
              {['16.0', '16.5', '17.0', '17.5', '18.0', '18.5'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleDiameterChange(parseFloat(sz))}
                  className={`py-2 rounded-full border transition-all cursor-pointer font-medium ${
                    closest.eu === sz
                      ? 'bg-[#F5EFE4] text-[#7A5B2B] border-[#C9AF82] font-semibold shadow-[0_1px_4px_rgba(154,119,66,0.12)]'
                      : 'bg-white border-[#EFE9DF] text-[#5C564E] hover:border-[#C9AF82] hover:text-[#2E2A25]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Calibration Toggle */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => setShowCalibration(!showCalibration)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-[#8A6836] bg-[#FCFBF8] border border-[#EFE9DF] hover:border-[#C9AF82] hover:bg-[#F7F3EC] transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 stroke-[1.75]" />
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
              <div className="mt-3.5 p-4 sm:p-5 rounded-2xl bg-[#FCFBF8] border border-[#EAE2D4] space-y-3 text-xs text-left animate-fadeIn">
                <p className="text-[#5C564E] leading-relaxed">
                  {lang === 'ka'
                    ? 'ნებისმიერი საბანკო ბარათის ან პირადობის სიგანე ზუსტად 85.6 მმ-ია. დაადეთ ბარათი ქვედა ჩარჩოს და გაასწორეთ სლაიდერი:'
                    : 'Standard cards are 85.6 mm wide. Match the card to the box below:'}
                </p>
                <div className="flex justify-center py-2">
                  <div
                    className="h-14 rounded-xl border-2 border-dashed border-[#B3925B] flex items-center justify-center text-xs font-medium text-[#8A6836] bg-white"
                    style={{ width: `${cardWidthPx}px`, maxWidth: '100%' }}
                  >
                    {lang === 'ka' ? 'ბარათის სიგანე (85.6 მმ)' : 'Card width (85.6 mm)'}
                  </div>
                </div>
                <input
                  type="range"
                  min="260"
                  max="420"
                  step="1"
                  value={cardWidthPx}
                  onChange={(e) => handleCardSlider(parseFloat(e.target.value))}
                  className="w-full accent-[#B3925B] cursor-pointer h-1.5 bg-[#EDE6DA] rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: თითის გაზომვა ქაღალდის ზოლით */}
      {activeTab === 'finger' && (
        <div className="space-y-4">
          <div className="space-y-2.5 text-xs sm:text-sm">
            {[
              {
                num: 1,
                text: lang === 'ka'
                  ? 'შემოიხვიეთ ვიწრო ქაღალდის ზოლი ან ძაფი სასურველ თითზე.'
                  : 'Wrap a narrow strip of paper or string around your finger.'
              },
              {
                num: 2,
                text: lang === 'ka'
                  ? 'კალმით მონიშნეთ ადგილი, სადაც ზოლი ზუსტად იკვრება ერთმანეთზე.'
                  : 'Mark with a pen where the ends overlap.'
              },
              {
                num: 3,
                text: lang === 'ka'
                  ? 'გაშალეთ ზოლი და გაზომეთ სახაზავით მილიმეტრებში (მაგ: 53 მმ).'
                  : 'Measure the strip with a ruler in millimeters (e.g. 53 mm).'
              }
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#EFE9DF]"
              >
                <span className="w-6 h-6 rounded-full bg-[#F5EFE4] border border-[#E5D8C1] text-[#7A5B2B] font-semibold flex items-center justify-center text-xs shrink-0">
                  {step.num}
                </span>
                <p className="text-[#4A453E] leading-relaxed pt-0.5">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#FCFBF8] border border-[#EAE2D4] space-y-3">
            <label className="block text-xs font-medium text-[#8A6836]">
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
                className="w-24 px-3 py-2.5 rounded-xl border border-[#E5DDD0] bg-white text-[#2E2A25] text-center font-semibold text-lg focus:border-[#B3925B] focus:outline-none"
              />
              <span className="text-xs font-medium text-[#857D73]">მმ</span>
              <div className="flex-1 text-right">
                <span className="text-[11px] text-[#857D73] block">
                  {lang === 'ka' ? 'რეკომენდებული ზომა:' : 'Recommended Size:'}
                </span>
                <span className="text-xl font-semibold font-serif text-[#9A7742]">
                  ზომა {closestFingerSize.eu}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: ზომების სრული ცხრილი */}
      {activeTab === 'table' && (
        <div className="rounded-2xl border border-[#EFE9DF] overflow-hidden bg-white">
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#EFE9DF] bg-[#FCFBF8] text-[11px] font-medium text-[#857D73] sticky top-0">
                  <th className="py-3 pl-4">{lang === 'ka' ? 'ზომა (EU)' : 'Size (EU)'}</th>
                  <th className="py-3">{lang === 'ka' ? 'დიამეტრი' : 'Diameter'}</th>
                  <th className="py-3">{lang === 'ka' ? 'გარშემოწერილობა' : 'Circumference'}</th>
                  <th className="py-3 pr-4">{lang === 'ka' ? 'აშშ (US)' : 'US'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8]">
                {SIZE_CHART.map((item) => {
                  const isCurrent = closest.eu === item.eu;
                  return (
                    <tr
                      key={item.eu}
                      onClick={() => handleDiameterChange(item.diameter)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-[#F5EFE4] text-[#7A5B2B] font-semibold shadow-[inset_3px_0_0_#B3925B]'
                          : 'hover:bg-[#FCFBF8] text-[#5C564E]'
                      }`}
                    >
                      <td className="py-2.5 pl-4 font-serif text-sm">{item.eu}</td>
                      <td className="py-2.5">{item.diameter.toFixed(1)} მმ</td>
                      <td className="py-2.5">{item.circumference.toFixed(1)} მმ</td>
                      <td className="py-2.5 pr-4">US {item.us}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ultra-Soft Atelier Notice Box */}
      {showNotice && (
        <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#EFE9DF] flex items-start gap-3 text-xs leading-relaxed">
          <div className="w-7 h-7 rounded-full bg-[#F5EFE4] text-[#9A7742] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div>
            <span className="font-medium text-[#2E2A25] block mb-1">
              {lang === 'ka' ? 'შენიშვნა ცდომილების შესახებ:' : 'Notice on Margin of Error:'}
            </span>
            <p className="text-[#6E675E] leading-relaxed">
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
