import React from "react";


const StepText = ({ text, setText, onNext }) => {
return (
<div className="p-6 bg-white shadow rounded-lg">
<h2 className="text-xl font-semibold mb-4">Step 1: Enter Question</h2>
<textarea
className="w-full border rounded p-3"
rows="4"
placeholder="Enter your question here..."
value={text}
onChange={(e) => setText(e.target.value)}
/>
<button
onClick={onNext}
className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
Next
</button>
</div>
);
};


export default StepText;