import React from "react";
import Image from "next/image";

function Footer() {
  return (
    <div className="flex justify-center items-center gap-x-40 py-4 bg-gray-900 sticky bottom-0">
      <div className="text-gray-100 font-medium">
        &copy; 2024 Ignomagine Pvt. Ltd. All rights reserved.
      </div>
      <div>
        <Image src="/images/footer.png" alt="footer image" width={200} height={100} />
      </div>
    </div>
  );
}

export default Footer;
