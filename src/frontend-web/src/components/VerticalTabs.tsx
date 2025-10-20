import { type ReactElement, type ReactNode, useState, Children } from "react";

type VerticalTabsProps = {
    children: ReactNode;
    activeIndex?: number;
    onTabChange?: (index: number) => void;
    extraContent?: ReactNode;
};

export const VerticalTabs = ({ children, activeIndex, onTabChange, extraContent }: VerticalTabsProps) => {
    const [internalIndex, setInternalIndex] = useState(0);
    const currentIndex = activeIndex ?? internalIndex;

    const tabsArray = Children.toArray(children) as ReactElement<{ label: string }>[];

    const handleTabClick = (index: number) => {
        if (onTabChange) {
            onTabChange(index);
        } else {
            setInternalIndex(index);
        }
    };

    return (
        <div style={{ display: "flex", width: "100%" }}>
            <div
                style={{
                    width: "200px",
                    minWidth: "200px",
                    background: "#f5f5f5",
                    borderRight: "1px solid #ccc",
                    display: "flex",
                    flexDirection: "column",
                    position: "sticky",   
                    top: 0,               
                    alignSelf: "flex-start",
                    height: "100vh"    
                }}
            >
                {extraContent && (
                    <div style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
                        {extraContent}
                    </div>
                )}

                {tabsArray.map((child, index) => (
                    <button
                        key={index}
                        style={{
                            padding: "1rem",
                            border: "none",
                            textAlign: "left",
                            backgroundColor: currentIndex === index ? "#ddd" : "transparent",
                            cursor: "pointer",
                            borderBottom: "1px solid #ddd",
                            fontWeight: currentIndex === index ? "bold" : "normal",
                        }}
                        onClick={() => handleTabClick(index)}
                    >
                        {child.props.label}
                    </button>
                ))}
            </div>

            <div style={{ flex: "1", padding: "1rem", width: "100%" }}>
                {tabsArray[currentIndex]}
            </div>
        </div>
    );
};
