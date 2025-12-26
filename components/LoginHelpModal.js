"use client";
import { X } from "lucide-react";

export default function LoginHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-xl font-bold text-gray-900 mb-4">Trouble Logging In?</h3>
        
        <div className="space-y-4 text-gray-600">
          <p>
            <strong>Forgot Password?</strong><br/>
            Since you are using a secure social login (Google/LinkedIn), please reset your password directly on their platforms. We do not store your passwords for your security.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> If you are unable to access your LinkedIn account, try recovering it at <a href="https://www.linkedin.com/uas/request-password-reset" target="_blank" className="underline font-semibold">linkedin.com</a>.
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Understood
        </button>
      </div>
    </div>
  );
}