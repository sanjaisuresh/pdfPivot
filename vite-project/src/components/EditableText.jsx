import { useEffect, useRef } from "react";

// new component just for editable text
const EditablePlacement = ({ p, handleTextChange }) => {
  const divRef = useRef(null);

  useEffect(() => {
    if (divRef.current && p.text !== divRef.current.innerText) {
      divRef.current.innerText = p.text || "";
    }
  }, [p.text]);

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      className="w-full h-full p-1 text-sm font-medium outline-none"
      onInput={(e) => handleTextChange(p.id, e.currentTarget.textContent)}
    />
  );
};
export default EditablePlacement;
