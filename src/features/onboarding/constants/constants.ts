export type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: any;
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "1",
    title: "The best car in your hands with ",
    subtitle:
      "Discover the convenience of finding your perfect ride with our Ryde App",
    image: require("@/assets/images/onboarding1.png"),
  },
  {
    id: "2",
    title: "The perfect ride is just a tap away!",
    subtitle:
      "Your journey begins with Drivo. Find your ideal ride effortlessly.",
    image: require("@/assets/images/onboarding2.png"),
  },
  {
    id: "3",
    title: "Your ride, your way. Let's get started!",
    subtitle:
      "Enter your destination, sit back, and let us take care of the rest.",
    image: require("@/assets/images/onboarding3.png"),
  },
];
