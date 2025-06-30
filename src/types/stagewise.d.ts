declare module '@stagewise/toolbar-react' {
  export interface StagewiseToolbarProps {
    config: {
      plugins: any[];
    };
    enabled?: boolean;
  }
  
  export const StagewiseToolbar: React.FC<StagewiseToolbarProps>;
}

declare module '@stagewise-plugins/react' {
  export const ReactPlugin: any;
} 