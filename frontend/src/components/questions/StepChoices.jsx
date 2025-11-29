import React from "react";

const StepChoices = ({ choices, setChoices, onBack, onNext }) => {
  const updateChoice = (idx, field, value) => {
    const updated = [...choices];
    updated[idx][field] = value;
    setChoices(updated);
  };

  const addChoice = () => {
    setChoices([...choices, { text: "", is_correct: false }]);
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Step 3: Add Choices</h2>

      {choices.map((c, index) => (
        <div key={index} className="mb-3 flex items-center space-x-3">
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder={`Choice ${index + 1}`}
            value={c.text}
            onChange={(e) =>
              updateChoice(index, "text", e.target.value)
            }
          />

          <input
            type="checkbox"
            checked={c.is_correct}
            onChange={(e) =>
              updateChoice(index, "is_correct", e.target.checked)
            }
          />
          <span>Correct</span>
        </div>
      ))}

      <button
        onClick={addChoice}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Add Choice
      </button>

      <div className="flex justify-between mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>

        <button
          onClick={onNext}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepChoices;
