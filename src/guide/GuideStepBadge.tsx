interface GuideStepBadgeProps {
  step: number;
}

export function GuideStepBadge({ step }: GuideStepBadgeProps) {
  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {step}
    </span>
  );
}
