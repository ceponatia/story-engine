"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);
    return isMobile;
}
const SidebarContext = React.createContext(null);
function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}
function SidebarProvider(_a) {
    var { defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children } = _a, props = __rest(_a, ["defaultOpen", "open", "onOpenChange", "className", "style", "children"]);
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp !== null && openProp !== void 0 ? openProp : _open;
    const setOpen = React.useCallback((value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
            setOpenProp(openState);
        }
        else {
            _setOpen(openState);
        }
        if (typeof document !== "undefined") {
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        }
    }, [setOpenProp, open]);
    const toggleSidebar = React.useCallback(() => {
        return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    const state = open ? "expanded" : "collapsed";
    const contextValue = React.useMemo(() => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
    }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
    return (<SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div data-slot="sidebar-wrapper" style={Object.assign({ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON }, style)} className={cn("group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex h-svh w-full overflow-hidden", className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>);
}
function Sidebar(_a) {
    var { side = "left", variant = "sidebar", collapsible = "offcanvas", className, children } = _a, props = __rest(_a, ["side", "variant", "collapsible", "className", "children"]);
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
        return (<div data-slot="sidebar" className={cn("bg-sidebar text-sidebar-foreground flex h-full w-[var(--sidebar-width)] flex-col", className)} {...props}>
        {children}
      </div>);
    }
    if (isMobile) {
        return (<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent data-sidebar="sidebar" data-slot="sidebar" data-mobile="true" className="bg-sidebar text-sidebar-foreground w-[var(--sidebar-width)] p-0 [&>button]:hidden" style={{
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            }} side={side}>
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>);
    }
    return (<div className="group peer text-sidebar-foreground hidden md:block" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side} data-slot="sidebar">
      <div data-slot="sidebar-gap" className={cn("relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]")}/>
      <div data-slot="sidebar-container" className={cn("fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex", side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]"
            : "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)] group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">
          {children}
        </div>
      </div>
    </div>);
}
function SidebarTrigger(_a) {
    var { className, onClick } = _a, props = __rest(_a, ["className", "onClick"]);
    const { toggleSidebar } = useSidebar();
    return (<Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="ghost" size="icon" className={cn("size-7", className)} onClick={(event) => {
            onClick === null || onClick === void 0 ? void 0 : onClick(event);
            toggleSidebar();
        }} {...props}>
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>);
}
function SidebarRail(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { toggleSidebar } = useSidebar();
    return (<button data-sidebar="rail" data-slot="sidebar-rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={cn("hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex", "group-data-[side=left]:cursor-w-resize group-data-[side=right]:cursor-e-resize", "group-data-[state=collapsed]:group-data-[side=left]:cursor-e-resize group-data-[state=collapsed]:group-data-[side=right]:cursor-w-resize", "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full", "group-data-[collapsible=offcanvas]:group-data-[side=left]:-right-2", "group-data-[collapsible=offcanvas]:group-data-[side=right]:-left-2", className)} {...props}/>);
}
function SidebarInset(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<main data-slot="sidebar-inset" className={cn("bg-background relative flex w-full flex-1 flex-col min-w-0 overflow-x-hidden overflow-y-auto", "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2", className)} {...props}/>);
}
function SidebarInput(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<Input data-slot="sidebar-input" data-sidebar="input" className={cn("bg-background h-8 w-full shadow-none", className)} {...props}/>);
}
function SidebarHeader(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div data-slot="sidebar-header" data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props}/>);
}
function SidebarFooter(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div data-slot="sidebar-footer" data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props}/>);
}
function SidebarSeparator(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<Separator data-slot="sidebar-separator" data-sidebar="separator" className={cn("bg-sidebar-border mx-2 w-auto", className)} {...props}/>);
}
function SidebarContent(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div data-slot="sidebar-content" data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props}/>);
}
function SidebarGroup(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div data-slot="sidebar-group" data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props}/>);
}
function SidebarGroupLabel(_a) {
    var { className, asChild = false } = _a, props = __rest(_a, ["className", "asChild"]);
    const Comp = asChild ? Slot : "div";
    return (<Comp data-slot="sidebar-group-label" data-sidebar="group-label" className={cn("text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props}/>);
}
function SidebarGroupAction(_a) {
    var { className, asChild = false } = _a, props = __rest(_a, ["className", "asChild"]);
    const Comp = asChild ? Slot : "button";
    return (<Comp data-slot="sidebar-group-action" data-sidebar="group-action" className={cn("text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 md:after:hidden", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
}
function SidebarGroupContent(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props}/>);
}
function SidebarMenu(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ul data-slot="sidebar-menu" data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props}/>);
}
function SidebarMenuItem(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props}/>);
}
const sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
    variants: {
        variant: {
            default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        },
        size: {
            default: "h-8 text-sm",
            sm: "h-7 text-xs",
            lg: "h-12 text-sm group-data-[collapsible=icon]:p-0",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
function SidebarMenuButton(_a) {
    var { asChild = false, isActive = false, variant = "default", size = "default", tooltip, className } = _a, props = __rest(_a, ["asChild", "isActive", "variant", "size", "tooltip", "className"]);
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();
    const button = (<Comp data-slot="sidebar-menu-button" data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ variant, size }), className)} {...props}/>);
    if (!tooltip) {
        return button;
    }
    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }
    return (<Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip}/>
    </Tooltip>);
}
function SidebarMenuAction(_a) {
    var { className, asChild = false, showOnHover = false } = _a, props = __rest(_a, ["className", "asChild", "showOnHover"]);
    const Comp = asChild ? Slot : "button";
    return (<Comp data-slot="sidebar-menu-action" data-sidebar="menu-action" className={cn("text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 md:after:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover &&
            "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0", className)} {...props}/>);
}
function SidebarMenuBadge(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div data-slot="sidebar-menu-badge" data-sidebar="menu-badge" className={cn("text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
}
function SidebarMenuSkeleton(_a) {
    var { className, showIcon = false } = _a, props = __rest(_a, ["className", "showIcon"]);
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);
    return (<div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon"/>}
      <Skeleton className="h-4 flex-1" data-sidebar="menu-skeleton-text" style={{
            "--skeleton-width": width,
            maxWidth: `var(--skeleton-width)`,
        }}/>
    </div>);
}
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar, };
