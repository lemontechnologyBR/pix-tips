import { QR_WIDGET_KEYFRAMES_CSS } from "@/lib/qr-widget-animation";

export function QrWidgetKeyframes() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: QR_WIDGET_KEYFRAMES_CSS,
      }}
    />
  );
}
