import { redirect } from "next/navigation";

export default function QrCodeRedirectPage() {
  redirect("/dashboard/widgets?tab=qrcode");
}
