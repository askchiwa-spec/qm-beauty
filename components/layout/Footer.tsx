import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1b2a2c] text-[#ece2d9] pt-12 pb-6 px-6 font-sans border-t-[5px] border-[#e0b89d]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
          
          {/* COLUMN 1: BRAND + CONTACT + BUTTONS */}
          <div className="flex flex-col gap-3">
            <div className="text-2xl font-medium bg-[var(--rose-gold)] text-[#1a2a2b] inline-block py-1 px-4 rounded-md tracking-[1px] shadow-md">
              QM<span className="font-light">Beauty</span>
            </div>
            <p className="italic text-[#e9dbd0] mt-1">natural · organic · ethical</p>

            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-2 shadow-md">
              CALL US
            </h4>
            <a href="tel:+255715727085" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
              <i className="fas fa-phone-alt w-5 text-[#ddbcab]"></i> +255 715 727 085
            </a>
            <a href="tel:+255657120151" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
              <i className="fas fa-mobile-alt w-5 text-[#ddbcab]"></i> +255 657 120 151
            </a>

            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-[#2d4648] border border-[#b5927e] text-[#f9ede2] py-1 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1">
                <i className="fas fa-calendar-check text-[var(--rose-gold)]"></i> BOOK SPA
              </span>
              <span className="bg-[#2d4648] border border-[#b5927e] text-[#f9ede2] py-1 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1">
                <i className="fas fa-shopping-bag text-[var(--rose-gold)]"></i> SHOP PRODUCTS
              </span>
            </div>
          </div>

          {/* COLUMN 2: LOCATION + HOURS */}
          <div className="flex flex-col gap-3">
            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-1 shadow-md">
              LOCATION
            </h4>
            <div className="flex items-start gap-2 mb-1">
              <i className="fas fa-road w-5 text-[#ddbcab] mt-1"></i>
              <span className="text-[#e9dbd0]">59 Ali Hassan Mwinyi Road</span>
            </div>
            <div className="flex items-start gap-2 mb-1">
              <i className="fas fa-city w-5 text-[#ddbcab] mt-1"></i>
              <span className="text-[#e9dbd0]">Oysterbay, Dar es Salaam</span>
            </div>
            <div className="ml-6 mt-1">
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#e9dbd0] text-sm underline decoration-dotted">
                <i className="fas fa-map-marked-alt"></i> View on map
              </a>
            </div>

            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-2 shadow-md">
              OPEN HOURS
            </h4>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between border-b border-dashed border-[#7f6a5c] pb-1 text-[#efe2d7]">
                <span className="font-bold text-[#f7e1d1]">Mon–Sat</span>
                <span className="text-white">9AM – 7PM</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-[#7f6a5c] pb-1 text-[#efe2d7]">
                <span className="font-bold text-[#f7e1d1]">Sunday</span>
                <span className="text-white">10AM – 4PM</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: EXPLORE + QUALITY */}
          <div className="flex flex-col gap-3">
            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-1 shadow-md">
              EXPLORE
            </h4>
            <ul className="list-none p-0">
              <li>
                <Link href="/shop?category=skincare" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
                  <i className="fas fa-leaf w-5 text-[#ddbcab]"></i> Skincare
                </Link>
              </li>
              <li>
                <Link href="/services" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
                  <i className="fas fa-spa w-5 text-[#ddbcab]"></i> Spa Services
                </Link>
              </li>
              <li>
                <Link href="/shop?category=haircare" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
                  <i className="fas fa-cut w-5 text-[#ddbcab]"></i> Haircare
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bundle" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
                  <i className="fas fa-gift w-5 text-[#ddbcab]"></i> Bundles
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center gap-2 text-[#e9dbd0] hover:text-[#f5d6b3] transition-colors">
                  <i className="fas fa-info-circle w-5 text-[#ddbcab]"></i> About Us
                </Link>
              </li>
            </ul>

            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-2 shadow-md">
              QUALITY
            </h4>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="bg-[#314a4a] py-1 px-3 rounded-full border border-[#b59886] text-[#f7eae0] text-sm">
                🌿 100% Natural
              </span>
              <span className="bg-[#314a4a] py-1 px-3 rounded-full border border-[#b59886] text-[#f7eae0] text-sm">
                🐇 Cruelty-Free
              </span>
            </div>
            <p className="ml-1 text-[#e9dbd0]">✦ Organic ingredients</p>
          </div>

          {/* COLUMN 4: PAYMENTS + CONNECT */}
          <div className="flex flex-col gap-3">
            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-1 shadow-md">
              WE ACCEPT
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#253d3f] border border-[#b28d78] text-[#f7e7db] py-1 px-3 rounded-full text-sm inline-flex items-center gap-1">
                  <i className="fab fa-cc-mastercard text-[var(--rose-gold)]"></i> Mastercard
                </span>
                <span className="bg-[#253d3f] border border-[#b28d78] text-[#f7e7db] py-1 px-3 rounded-full text-sm inline-flex items-center gap-1">
                  <i className="fab fa-cc-visa text-[var(--rose-gold)]"></i> Visa
                </span>
                <span className="bg-[#253d3f] border border-[#b28d78] text-[#f7e7db] py-1 px-3 rounded-full text-sm inline-flex items-center gap-1">
                  <i className="fas fa-wifi text-[var(--rose-gold)]"></i> Tigopesa
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="bg-[#253d3f] border border-[#b28d78] text-[#f7e7db] py-1 px-3 rounded-full text-sm inline-flex items-center gap-1">
                  <i className="fas fa-mobile-alt text-[var(--rose-gold)]"></i> M-Pesa
                </span>
                <span className="bg-[#253d3f] border border-[#b28d78] text-[#f7e7db] py-1 px-3 rounded-full text-sm inline-flex items-center gap-1">
                  <i className="fas fa-sim-card text-[var(--rose-gold)]"></i> Airtel Money
                </span>
                <span className="bg-[#253d3f] border border-[#b28d78] text-[#f7e7db] py-1 px-3 rounded-full text-sm inline-flex items-center gap-1">
                  <i className="fas fa-globe text-[var(--rose-gold)]"></i> Selcom
                </span>
              </div>
              <div className="text-[#d0bcac] text-xs mt-1 flex items-center gap-1">
                <i className="fas fa-shield-alt"></i> Secure payments - all major methods
              </div>
            </div>

            <h4 className="bg-[var(--rose-gold)] text-[#1b2a2c] inline-block py-1 px-4 rounded-md text-sm font-bold uppercase tracking-[1px] my-2 shadow-md">
              CONNECT
            </h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/qmbeautytz" target="_blank" rel="noopener noreferrer" className="text-[#f0dac8] text-xl hover:text-[#f5c842] transition-colors">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://facebook.com/qmbeauty.1" target="_blank" rel="noopener noreferrer" className="text-[#f0dac8] text-xl hover:text-[#f5c842] transition-colors">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://wa.me/255657120151" target="_blank" rel="noopener noreferrer" className="text-[#f0dac8] text-xl hover:text-[#f5c842] transition-colors">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM LINKS: Privacy | Terms | Contact | View Map */}
        <div className="border-t border-[#4e6769] mt-8 pt-6 flex flex-wrap justify-between items-center gap-4 text-sm">
          <div className="text-[#cfbaa8]">
            © {new Date().getFullYear()} QMBeauty — natural · organic · ethical
          </div>
          <div className="flex items-center gap-2 text-[#cfbaa8]">
            <Link href="/privacy" className="text-[#edd9c9] hover:underline">Privacy</Link> <span className="text-[#b29581]">|</span>
            <Link href="/terms" className="text-[#edd9c9] hover:underline">Terms</Link> <span className="text-[#b29581]">|</span>
            <Link href="/contact" className="text-[#edd9c9] hover:underline">Contact</Link> <span className="text-[#b29581]">|</span>
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#edd9c9] hover:underline flex items-center gap-1">
              <i className="fas fa-map-marker-alt text-xs"></i> View Map
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}