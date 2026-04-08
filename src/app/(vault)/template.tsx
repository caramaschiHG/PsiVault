"use client";

export default function VaultTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="vault-page-transition">
      {children}
    </div>
  );
}
