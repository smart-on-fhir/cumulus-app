
export abstract class Command
{
    public abstract execute(): void | Promise<any>;
    
    public abstract label(ctx?: Record<string, any>): string | JSX.Element;

    public available(ctx?: Record<string, any>): boolean {
        return true; // unless redefined in sub-class
    }

    public enabled(ctx?: Record<string, any>): boolean {
        return true; // unless redefined in sub-class
    }

    public active(ctx?: Record<string, any>): boolean {
        return false; // unless redefined in sub-class
    }

    public icon(ctx?: Record<string, any>): JSX.Element | undefined {
        return undefined; // unless redefined in sub-class
    }

    public description(ctx?: Record<string, any>): string | undefined {
        return undefined; // unless redefined in sub-class
    }
}
