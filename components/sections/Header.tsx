import Image from "next/image";
import Link from "next/link";
import NavMenu from "./NavMenu";

// Site header (WP ElementsKit template 2093): sticky navy bar, logo, main menu, "Get FREE Quote" (≥1367px only).
export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-[90px] items-center justify-between bg-navy pr-[70px] pl-[46px] shadow-[0_21px_24px_-22px_rgba(59,98,122,0.54)] md:h-[110px] md:pr-0 md:pl-0 lg:px-5 xl:h-[120px]">
      <Link href="/" className="shrink-0 md:pl-[30%] lg:ml-[25px] lg:flex lg:w-[196px] lg:justify-center lg:pl-0 xl:ml-0 xl:w-auto xl:pl-[31px]">
        <Image
          src="/uploads/2025/08/Zoot-Digital-logo-white.png"
          alt="zoot web agency"
          title="zoot web agency"
          width={400}
          height={200}
          preload
          className="size-[70px] object-cover md:size-[85px] lg:size-[91px] xl:size-[100px]"
        />
      </Link>
      <NavMenu />
      <Link
        href="/contact/"
        className="mr-5 hidden rounded-[4px] bg-heading px-[30px] py-[15px] font-tight text-[15px]/[26px] text-navy hover:bg-lime xl:inline-flex"
      >
        Get FREE Quote
      </Link>
    </header>
  );
}
