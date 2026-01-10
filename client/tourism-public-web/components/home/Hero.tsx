import Image from "next/image";

import headerImage from "@/app/assets/header.png";

export function Hero() {
  return (
    <section className="relative h-[360px] w-full overflow-hidden bg-black text-white md:h-[480px]">
      <Image
        src={headerImage}
        alt="Paris skyline"
        priority
        fill
        sizes="100vw"
        className="object-fill"
      />
    </section>
  );
}
