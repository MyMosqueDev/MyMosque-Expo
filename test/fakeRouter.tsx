import { ReactNode } from "react";
import { Text } from "react-native";

type Href = string | { pathname: string; params?: Record<string, string> };

/** Minimal expo-router: the active screen, its params, and recorded navigation. */
class FakeRouter {
  params: Record<string, string> = {};
  pathname = "/";
  screen: ReactNode = null;
  navigations: [string, Href][] = [];
  private seen = new Set<string>();

  /** Distinct link targets rendered so far, in order. */
  get hrefs() {
    return [...this.seen].map((h) => JSON.parse(h) as Href);
  }

  sawLink(href: Href) {
    this.seen.add(JSON.stringify(href));
  }

  reset() {
    this.seen = new Set();
    this.params = {};
    this.pathname = "/";
    this.screen = null;
    this.navigations = [];
  }
}

export const fakeRouter = new FakeRouter();

export const routerModule = () => {
  const navigate = (kind: string) => (href: Href) => {
    fakeRouter.navigations.push([kind, href]);
  };
  const router = {
    push: navigate("push"),
    replace: navigate("replace"),
    navigate: navigate("navigate"),
    back: () => navigate("back")(""),
  };
  const Stack = () => <>{fakeRouter.screen}</>;
  const StackScreen = () => null;
  Stack.Screen = StackScreen;
  const Link = ({ children, href }: { children: ReactNode; href: Href }) => {
    fakeRouter.sawLink(href);
    return <Text onPress={() => router.push(href)}>{children}</Text>;
  };
  return {
    Stack,
    Link,
    router,
    useRouter: () => router,
    useLocalSearchParams: () => fakeRouter.params,
    usePathname: () => fakeRouter.pathname,
  };
};
