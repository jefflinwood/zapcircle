import { useModal } from "./useModal";

export function Modal() {
  const { isOpen, closeModal } = useModal();

  if (!isOpen) return null;

  return (
    <div className="modal">
      Modal Content
      <button onClick={closeModal}>Close</button>
    </div>
  );
}