"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl">🎉</span>
          </div>
          <DialogTitle className="text-2xl font-bold">Welcome to PetRide!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You're now on our waitlist. We'll notify you as soon as PetRide launches in your city!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-card p-4">
            <p className="text-sm text-card-foreground">
              <strong>What's next?</strong>
              <br />
              We're working hard to bring PetRide to your area. You'll be among the first to know when we're ready to
              give your furry friend the ride they deserve!
            </p>
          </div>

          <Button onClick={onClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
