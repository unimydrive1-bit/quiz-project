import React from "react";

const StepConfirm = ({ text, qtype, choices, tfValue, onBack, onSave }) => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Step 4: Confirm & Save Question</h2>

      <p className="font-medium mb-1">Question:</p>
      <p>{text}</p>

      <p className="font-medium mt-4 mb-1">Type:</p>
      <p className="uppercase">{qtype}</p>

      {qtype === "mcq" && (
        <>
          <p className="font-medium mt-4 mb-1">Choices:</p>
          <ul className="list-disc ml-6">
            {choices.map((c, i) => (
              <li
                key={i}
                className={c.is_correct ? "font-bold text-green-700" : ""}
              >
                {c.text || <span className="text-gray-400">[empty]</span>}
              </li>
            ))}
          </ul>
        </>
      )}

      {qtype === "tf" && (
        <>
          <p className="font-medium mt-4 mb-1">Correct Answer:</p>
          <p className="text-green-700 font-semibold">
            {tfValue === "true" ? "True" : "False"}
          </p>
        </>
      )}

      {qtype === "short" && (
        <p className="mt-4 text-sm text-gray-600">
          Short answer question – students will type their own response.
        </p>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back
        </button>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Question
        </button>
      </div>
    </div>
  );
};

export default StepConfirm;
