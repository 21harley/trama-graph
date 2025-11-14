type DownloadLogsButtonProps = {
  onDownload: () => void;
  className?: string;
};

export default function DownloadLogsButton({ onDownload, className }: DownloadLogsButtonProps) {
  return (
    <button className={className} onClick={onDownload}>
      Descargar registro
    </button>
  );
}
