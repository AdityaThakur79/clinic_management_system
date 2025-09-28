import { Box } from "@chakra-ui/react";

import React from "react";

export const renderTrack = ({ style, ...props }) => {
  const trackStyle = {
    position: "absolute",
    maxWidth: "100%",
    width: 8,
    transition: "opacity 200ms ease 0s",
    opacity: 0.2,
    background: "rgba(0, 0, 0, 0.1)",
    bottom: 2,
    top: 2,
    borderRadius: 4,
    right: 2,
  };
  return <div style={{ ...style, ...trackStyle }} {...props} />;
};
export const renderThumb = ({ style, ...props }) => {
  const thumbStyle = {
    borderRadius: 4,
    background: "rgba(43, 168, 209, 0.8)",
    transition: "background 200ms ease 0s",
    cursor: "pointer",
  };
  return <div style={{ ...style, ...thumbStyle }} {...props} />;
};
export const renderView = ({ style, ...props }) => {
  const viewStyle = {
    marginBottom: -22,
    paddingRight: 8,
    overflow: "hidden",
  };
  return (
    <Box
      me={{ base: "0px !important", lg: "-16px !important" }}
      style={{ ...style, ...viewStyle }}
      {...props}
    />
  );
};