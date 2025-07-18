"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import toast from "react-hot-toast";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export function ChangeEmailModal({ isOpen, onClose, currentEmail }: ChangeEmailModalProps) {
  const { user, requestEmailChange } = useAuth();
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmail.trim()) {
      toast.error("Please enter a new email address");
      return;
    }

    if (newEmail === currentEmail) {
      toast.error("New email must be different from current email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the auth provider method to request email change
      await requestEmailChange(newEmail);
      
      // Close modal and reset form
      onClose();
      setNewEmail("");
      
    } catch (error: any) {
      console.error('Email change error:', error);
      // Error handling is done in the auth provider
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setNewEmail("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Email Address" className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-primary" />
          <span className="font-medium">Change Email Address</span>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="current-email">Current Email</Label>
          <Input
            id="current-email"
            type="email"
            value={currentEmail}
            disabled
            className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-email">New Email Address</Label>
          <Input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter your new email address"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Email Verification Required
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                We'll send a verification email to your new address. You must click the confirmation link to complete the email change.
              </p>
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !newEmail.trim()}
          >
            {isSubmitting ? 'Sending...' : 'Send Verification Email'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}