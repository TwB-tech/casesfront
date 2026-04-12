import * as React from "react"
import { useTheme } from "../../contexts/ThemeContext";
import { cn } from "../lib/utils";

const Card = React.forwardRef(({ className, hover = false, glow = false, ...props }, ref) => {
  const { isFuturistic, themeConfig } = useTheme();
  
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border transition-all duration-300",
        isFuturistic 
          ? "bg-cyber-card border-cyber-border shadow-lg" 
          : "bg-white border-neutral-200 shadow-card",
        hover && "hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        glow && isFuturistic && "hover:border-aurora-primary hover:shadow-glow-md",
        className
      )}
      style={props.style}
      {...props} 
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => {
  const { isFuturistic } = useTheme();
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        isFuturistic ? "border-b border-cyber-border" : "",
        className
      )}
      {...props} 
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, gradient = false, ...props }, ref) => {
  const { isFuturistic } = useTheme();
  
  return (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight",
        isFuturistic ? "text-aurora-text" : "text-neutral-800",
        gradient && isFuturistic && "gradient-text",
        className
      )}
      {...props} 
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { isFuturistic } = useTheme();
  
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        isFuturistic ? "text-aurora-muted" : "text-neutral-500",
        className
      )}
      {...props} 
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-0", className)} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef(({ className, ...props }, ref) => {
  const { isFuturistic } = useTheme();
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        isFuturistic ? "border-t border-cyber-border" : "",
        className
      )}
      {...props} 
    />
  )
})
CardFooter.displayName = "CardFooter"

const StatCard = React.forwardRef(({ 
  className, 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendUp = true,
  ...props 
}, ref) => {
  const { isFuturistic, themeConfig } = useTheme();
  
  return (
    <Card 
      ref={ref}
      hover 
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {isFuturistic && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-aurora-primary/20 to-transparent rounded-bl-full" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            isFuturistic ? "text-aurora-muted" : "text-neutral-500"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold",
            isFuturistic ? "text-aurora-text" : "text-neutral-900"
          )}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-sm mt-2 flex items-center gap-1",
              trendUp ? "text-success" : "text-danger"
            )}>
              <span>{trendUp ? '+' : '-'}{trend}</span>
              <span className={isFuturistic ? "text-aurora-muted" : "text-neutral-500"}>vs last month</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isFuturistic ? "bg-aurora-primary/20" : "bg-primary-50"
          )}>
            <Icon className={cn(
              "text-xl",
              isFuturistic ? "text-aurora-primary" : "text-primary-600"
            )} />
          </div>
        )}
      </div>
    </Card>
  )
})
StatCard.displayName = "StatCard"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, StatCard }
