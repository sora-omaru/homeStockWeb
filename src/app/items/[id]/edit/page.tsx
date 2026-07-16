import { ItemEditPage } from "./_components/item-edit-page";
import { ItemPageLayout } from "./_components/item-page-layout";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ItemPageLayout>
      <ItemEditPage key={id} itemId={Number(id)} />
    </ItemPageLayout>
  );
}
