import { mode } from "@chakra-ui/theme-tools";
export const buttonStyles = {
  components: {
    Button: {
      baseStyle: {
        borderRadius: "16px",
        boxShadow: "45px 76px 113px 7px rgba(112, 144, 176, 0.08)",
        transition: ".25s all ease",
        boxSizing: "border-box",
        _focus: {
          boxShadow: "none",
        },
        _active: {
          boxShadow: "none",
        },
      },
      variants: {
        outline: () => ({
          borderRadius: "16px",
        }),
        brand: (props) => ({
          bg: mode("brand.500", "brand.400")(props),
          color: "white",
          _focus: {
            bg: mode("brand.500", "brand.400")(props),
          },
          _active: {
            bg: mode("brand.500", "brand.400")(props),
          },
          _hover: {
            bg: mode("brand.600", "brand.400")(props),
          },
        }),
        darkBrand: (props) => ({
          bg: mode("brand.900", "brand.400")(props),
          color: "white",
          _focus: {
            bg: mode("brand.900", "brand.400")(props),
          },
          _active: {
            bg: mode("brand.900", "brand.400")(props),
          },
          _hover: {
            bg: mode("brand.800", "brand.400")(props),
          },
        }),
        lightBrand: (props) => ({
          bg: mode("#F2EFFF", "whiteAlpha.100")(props),
          color: mode("brand.500", "white")(props),
          _focus: {
            bg: mode("#F2EFFF", "whiteAlpha.100")(props),
          },
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        light: (props) => ({
          bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          color: mode("secondaryGray.900", "white")(props),
          _focus: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _active: {
            bg: mode("secondaryGray.300", "whiteAlpha.100")(props),
          },
          _hover: {
            bg: mode("secondaryGray.400", "whiteAlpha.200")(props),
          },
        }),
        action: (props) => ({
          fontWeight: "500",
          borderRadius: "50px",
          bg: mode("secondaryGray.300", "brand.400")(props),
          color: mode("brand.500", "white")(props),
          _focus: {
            bg: mode("secondaryGray.300", "brand.400")(props),
          },
          _active: { bg: mode("secondaryGray.300", "brand.400")(props) },
          _hover: {
            bg: mode("secondaryGray.200", "brand.400")(props),
          },
        }),
        setup: (props) => ({
          fontWeight: "500",
          borderRadius: "50px",
          bg: mode("transparent", "brand.400")(props),
          border: mode("1px solid", "0px solid")(props),
          borderColor: mode("secondaryGray.400", "transparent")(props),
          color: mode("secondaryGray.900", "white")(props),
          _focus: {
            bg: mode("transparent", "brand.400")(props),
          },
          _active: { bg: mode("transparent", "brand.400")(props) },
          _hover: {
            bg: mode("secondaryGray.100", "brand.400")(props),
          },
        }),
        primary: (props) => ({
          fontWeight: "600",
          borderRadius: "12px",
          bg: "linear-gradient(135deg, #3AC0E7 0%, #2BA8D1 100%)",
          color: "white",
          border: "none",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          _before: {
            content: '""',
            position: "absolute",
            top: 0,
            left: "-100%",
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            transition: "left 0.5s",
          },
          _focus: {
            bg: "linear-gradient(135deg, #3AC0E7 0%, #2BA8D1 100%)",
            boxShadow: "0 0 0 4px rgba(58, 192, 231, 0.25), 0 8px 25px rgba(58, 192, 231, 0.3)",
            transform: "translateY(-2px)",
          },
          _active: { 
            bg: "linear-gradient(135deg, #2BA8D1 0%, #1E8BB8 100%)",
            transform: "translateY(0px) scale(0.98)",
            boxShadow: "0 4px 15px rgba(58, 192, 231, 0.4)",
          },
          _hover: {
            bg: "linear-gradient(135deg, #2BA8D1 0%, #1E8BB8 100%)",
            transform: "translateY(-3px)",
            boxShadow: "0 10px 30px rgba(58, 192, 231, 0.4), 0 0 0 1px rgba(58, 192, 231, 0.1)",
            _before: {
              left: "100%",
            },
          },
        }),
        outline: (props) => ({
          fontWeight: "600",
          borderRadius: "12px",
          bg: "transparent",
          color: "#3AC0E7",
          border: "2px solid #3AC0E7",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          _before: {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "0%",
            height: "100%",
            bg: "linear-gradient(135deg, #3AC0E7 0%, #2BA8D1 100%)",
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 0,
          },
          _focus: {
            bg: "rgba(58, 192, 231, 0.08)",
            boxShadow: "0 0 0 4px rgba(58, 192, 231, 0.25), 0 8px 25px rgba(58, 192, 231, 0.15)",
            transform: "translateY(-2px)",
            borderColor: "#2BA8D1",
          },
          _active: { 
            bg: "rgba(58, 192, 231, 0.15)",
            transform: "translateY(0px) scale(0.98)",
            borderColor: "#1E8BB8",
            _before: {
              width: "100%",
            },
          },
          _hover: {
            bg: "transparent",
            borderColor: "#2BA8D1",
            color: "white",
            transform: "translateY(-3px)",
            boxShadow: "0 10px 30px rgba(58, 192, 231, 0.25), 0 0 0 1px rgba(58, 192, 231, 0.1)",
            _before: {
              width: "100%",
            },
          },
        }),
        secondary: (props) => ({
          fontWeight: "600",
          borderRadius: "12px",
          bg: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
          color: "#2d3748",
          border: "1px solid #e2e8f0",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          _focus: {
            bg: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
            boxShadow: "0 0 0 4px rgba(226, 232, 240, 0.5), 0 8px 25px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-2px)",
            borderColor: "#cbd5e0",
          },
          _active: { 
            bg: "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)",
            transform: "translateY(0px) scale(0.98)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          },
          _hover: {
            bg: "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)",
            transform: "translateY(-3px)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(226, 232, 240, 0.5)",
            borderColor: "#cbd5e0",
          },
        }),
        danger: (props) => ({
          fontWeight: "600",
          borderRadius: "12px",
          bg: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
          color: "white",
          border: "none",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          _focus: {
            bg: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
            boxShadow: "0 0 0 4px rgba(229, 62, 62, 0.25), 0 8px 25px rgba(229, 62, 62, 0.3)",
            transform: "translateY(-2px)",
          },
          _active: { 
            bg: "linear-gradient(135deg, #c53030 0%, #9c2626 100%)",
            transform: "translateY(0px) scale(0.98)",
            boxShadow: "0 4px 15px rgba(229, 62, 62, 0.4)",
          },
          _hover: {
            bg: "linear-gradient(135deg, #c53030 0%, #9c2626 100%)",
            transform: "translateY(-3px)",
            boxShadow: "0 10px 30px rgba(229, 62, 62, 0.4), 0 0 0 1px rgba(229, 62, 62, 0.1)",
          },
        }),
      },
    },
  },
};
