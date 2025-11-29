import React from "react";

const StepTrueFalse = ({ tfValue, setTfValue, onBack, onNext }) => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Step 3: Select Correct Answer</h2>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="tf"
            value="true"
            checked={tfValue === "true"}
            onChange={() => setTfValue("true")}
          />
          <span>True</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="tf"
            value="false"
            checked={tfValue === "false"}
            onChange={() => setTfValue("false")}
          />
          <span>False</span>
        </label>
      </div>

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

export default StepTrueFalse;
