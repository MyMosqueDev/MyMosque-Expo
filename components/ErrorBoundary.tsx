import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#f8f9fa",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#FF6B6B",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#6c757d",
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            {this.state.error?.message || "An unexpected error occurred"}
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false })}
            style={{
              backgroundColor: "#5B4B94",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
