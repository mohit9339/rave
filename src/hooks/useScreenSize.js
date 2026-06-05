import { useEffect, useState } from "react";

export default function useScreenSize() {
  const [width, setWidth] =
    useState(window.innerWidth);

  useEffect(() => {
    const handleResize =
      () =>
        setWidth(
          window.innerWidth
        );

    window.addEventListener(
      "resize",
      handleResize
    );

    return () =>
      window.removeEventListener(
        "resize",
        handleResize
      );
  }, []);

  return {
    width,
    isMobile:
      width <= 768,
    isTablet:
      width <= 1024,
    isSmallMobile:
      width <= 400,
  };
}