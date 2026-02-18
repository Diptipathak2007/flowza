"use client";

// Re-export from the single source of truth to avoid Context duplication
export { useModal, ModalContext } from "@/providers/modal-provider";
import ModalProvider from "@/providers/modal-provider";
export default ModalProvider;
