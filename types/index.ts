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

export type ExtendedFile = {
  id: string;
  url?: string;
  filename: string;
  title: string;
  size: number;
  type: string;
  thumbnail: string;
  file: File;
  metadata: FileMetadata;
};

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

export type PostData = {
  generatorId: number;
  numKeywords: number;
  titleChars: number;
  files: ExtendedFile[];
};
