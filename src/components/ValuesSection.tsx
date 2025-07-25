import { Hand, Heart, MapPin, Handshake } from "lucide-react";

const values = [
  {
    icon: Hand,
    title: "Curated Finds",
    description: "Carefully selected authentic pieces from skilled artisans"
  },
  {
    icon: Heart,
    title: "Made With Love",
    description: "Every product crafted with passion and cultural pride"
  },
  {
    icon: MapPin,
    title: "Local Impact",
    description: "Supporting communities and preserving traditional crafts"
  },
  {
    icon: Handshake,
    title: "Fair Trade",
    description: "Ensuring artisans receive fair compensation for their work"
  }
];

export const ValuesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="value-card animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-soft">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3">
                {value.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};