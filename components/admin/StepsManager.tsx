// /components/admin/StepsManager.tsx
import { Step } from "@/types/recipe";
import { AnimatePresence, motion } from "framer-motion";
import StepItem from "./StepItem";

interface Props {
  steps: Step[];
  setSteps: (steps: Step[]) => void;
}

export default function StepsManager({ steps, setSteps }: Props) {
  const addStep = () => {
    setSteps([...steps, { title: "", description: [""], image: null }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updatedStep: Step) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    setSteps(newSteps);
  };

  return (
    <div className="my-6">
      <h3 className="mb-2 text-lg font-semibold">Kroki przygotowania</h3>
      <div className="space-y-4">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={index} // Idealnie byłoby użyć unikalnego ID
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <StepItem
                step={step}
                index={index}
                updateStep={updateStep}
                removeStep={removeStep}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={addStep}
        className="mt-4 rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
      >
        Dodaj nowy krok
      </button>
    </div>
  );
}

// /components/admin/StepItem.tsx
// ... (logika pojedynczego kroku z polami: title, description, ImageUploader)
// Poniżej uproszczony przykład StepItem.tsx

import ImageUploader from "./ImageUploader";

interface StepItemProps {
  step: Step;
  index: number;
  updateStep: (index: number, step: Step) => void;
  removeStep: (index: number) => void;
}

export default function StepItem({
  step,
  index,
  updateStep,
  removeStep,
}: StepItemProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    // Opis jest tablicą, dla uproszczenia traktujemy go jako pojedynczy tekst
    const newDescription =
      name === "description" ? value.split("\n") : step.description;
    updateStep(index, {
      ...step,
      [name]: name === "description" ? newDescription : value,
    });
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-bold">Krok {index + 1}</h4>
        <button
          type="button"
          onClick={() => removeStep(index)}
          className="text-red-500 hover:text-red-700"
        >
          Usuń krok
        </button>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          name="title"
          value={step.title}
          onChange={handleChange}
          placeholder="Tytuł kroku (np. Mieszanie składników)"
          className="w-full rounded-md"
        />
        <textarea
          name="description"
          value={step.description.join("\n")}
          onChange={handleChange}
          placeholder="Opis kroku..."
          className="w-full rounded-md"
          rows={3}
        ></textarea>
        <ImageUploader
          label="Zdjęcie do kroku"
          onImageUpload={(path) => updateStep(index, { ...step, image: path })}
          onImageRemove={() => updateStep(index, { ...step, image: null })}
        />
      </div>
    </div>
  );
}
