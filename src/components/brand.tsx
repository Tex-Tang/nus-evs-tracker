import Logo from "./logo";

export type BrandProps = React.ComponentPropsWithoutRef<"div">;

export default function Brand(props: BrandProps) {
  return (
    <div {...props} className="text-center mb-8">
      <div className="text-2xl font-medium sm:text-4xl">NUS EVS Tracker</div>
      <div className="mt-1 flex items-center justify-center gap-1 text-base sm:mt-2 sm:text-xl">
        developed by
        <a href="https://rellort.dev" className="flex items-center gap-1">
          <Logo className="w-[18px] sm:w-[28px]" />
          <span className="font-medium">rellort.dev</span>
        </a>
      </div>
    </div>
  );
}
