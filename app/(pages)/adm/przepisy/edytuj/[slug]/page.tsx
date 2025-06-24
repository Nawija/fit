// /app/adm/przepisy/edytuj/[slug]/page.tsx

import EditRecipeView from "./EditRecipeView";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const awaitedParams = await Promise.resolve(params);
  const { slug } = awaitedParams;

  return <EditRecipeView slug={slug} />;
}
