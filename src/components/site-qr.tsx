"use client";
import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";
import { Download } from "lucide-react";
import { Button } from "./ui/button";
import "./site-qr.css";

export function SiteQr({ url, label, fileName }: { url: string; label: string; fileName: string }) {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    toDataURL(url, { errorCorrectionLevel: "M", margin: 2, width: 320, color: { dark: "#1c3328", light: "#ffffff" } })
      .then(image => { if (live) setSrc(image); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, [url]);
  function download() {
    const link = document.createElement("a");
    link.href = src; link.download = fileName; link.click();
  }
  return <figure className="site-qr">
    {src ? <img src={src} width={168} height={168} alt={label} /> : <div className="site-qr-pending" role="status">{failed ? "QR을 만들지 못했어요. 주소를 직접 공유해주세요." : "QR을 만들고 있어요…"}</div>}
    {src && <Button type="button" variant="outline" size="sm" onClick={download}><Download size={16} />QR 저장</Button>}
  </figure>;
}
