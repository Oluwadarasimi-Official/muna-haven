import UpdateForm from "@/components/admin/UpdateForm";

export default function NewUpdatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-espresso">New update</h1>
        <p className="text-sm text-espresso/60 mt-1">
          It appears on the Updates page as soon as you publish it.
        </p>
      </div>
      <UpdateForm update={null} />
    </div>
  );
}
