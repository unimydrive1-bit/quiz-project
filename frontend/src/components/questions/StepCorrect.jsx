import React from "react";


const StepCorrect = ({ choices, onBack, onSubmit }) => {
return (
<div className="p-6 bg-white shadow rounded-lg">
<h2 className="text-xl font-semibold mb-4">Step 4: Confirm Correct Answer</h2>


<ul className="list-disc ml-6">
{choices.map((c, index) => (
<li key={index} className={c.is_correct ? "font-bold text-green-700" : ""}>
{c.text} {c.is_correct && "(Correct)"}
</li>
))}
</ul>


<div className="flex justify-between mt-4">
<button
onClick={onBack}
className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
>
Back
</button>


<button
onClick={onSubmit}
className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
>
Save Question
</button>
</div>
</div>
);
};


export default StepCorrect;