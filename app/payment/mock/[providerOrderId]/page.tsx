import MockPaymentCheckout from "@/app/components/payment/MockPaymentCheckout";

type MockPaymentPageProps = {
  params: Promise<{
    providerOrderId: string;
  }>;
};

export default async function MockPaymentPage({
  params,
}: MockPaymentPageProps) {
  const { providerOrderId } = await params;

  return (
    <MockPaymentCheckout
      providerOrderId={providerOrderId}
    />
  );
}