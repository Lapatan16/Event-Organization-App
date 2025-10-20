import { type ReactNode } from "react";

export type VerticalTabProps = {
    label: string;
    children: ReactNode;
};

export const VerticalTab = ({ children }: VerticalTabProps) => {
    return <div>{children}</div>;
};
