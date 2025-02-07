import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type SidebarItem = {
  title: string;
  icon: React.FC<IconSvgProps>;
  href: string;
  badge?: string;
};

export interface Generator {
  id: number;
  title: string;
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  csvRequirements: {
    structure: string[];
    generate: string[];
    delimiter: string;
  };
  categories?: Array<{ id: number; name: string }>;
  models?: Array<string>;
  comingSoon: boolean;
}

export interface ExtendedFile {
  id: string;
  file: File;
  filename: string;
  title: string;
  size: number;
  type: string;
  thumbnail: string;
  url?: string;
  metadata: any | null;
}

export type FileMetadata = {
  Title: string;
  Keywords: string[];
  Description?: string;
  Category?: number;
  Categories?: number[] | (string | undefined)[];
  "Image Name"?: string;
  status?: null | boolean;
  Model?: string;
};

export interface PostData {
  generatorId: number;
  numKeywords: number;
  titleChars: number;
  files: ExtendedFile[];
}
