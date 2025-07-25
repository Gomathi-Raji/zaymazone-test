import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const TestimonialSection = () => {
  return (
    <section className="py-20 bg-gradient-warm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <blockquote className="text-3xl sm:text-4xl font-bold text-foreground mb-8 leading-relaxed">
            "Zaymazone lets my story and heritage 
            shine through every product sold."
          </blockquote>
          
          <cite className="text-lg text-muted-foreground font-medium">
            Renu, Rajasthan
          </cite>
        </div>
        
        <div className="mt-16 bg-white rounded-3xl p-8 sm:p-12 shadow-elegant">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join as a Seller
          </h3>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Empower your craft, reach new customers.
          </p>
          
          <Button className="btn-hero" asChild>
            <Link to="/seller-onboarding">Start Selling</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};