import React from "react";

const StepType = ({ qtype, setQtype, onNext }) => {
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Step 1: Choose Question Type</h2>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="qtype"
            value="mcq"
            checked={qtype === "mcq"}
            onChange={(e) => setQtype(e.target.value)}
          />
          <span>Multiple Choice</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="qtype"
            value="tf"
            checked={qtype === "tf"}
            onChange={(e) => setQtype(e.target.value)}
          />
          <span>True / False</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="qtype"
            value="short"
            checked={qtype === "short"}
            onChange={(e) => setQtype(e.target.value)}
          />
          <span>Short Answer</span>
        </label>
      </div>

      <button
        onClick={onNext}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Next
      </button>
    </div>
  );
};

export default StepType;
