import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Calendar, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Outdoor Advertising India | Hoardings, Billboards, Bus Shelters | OOH Media Booking",
  description:
    "Find and book outdoor advertising spaces across India. Discover hoardings, billboards, bus shelters, gantry ads, and digital displays in Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata. India's largest OOH advertising platform.",
  keywords: [
    "outdoor advertising India",
    "hoarding advertising Mumbai",
    "billboard advertising Delhi",
    "bus shelter ads Bangalore",
    "gantry advertising Chennai",
    "OOH media booking India",
    "outdoor advertising rates",
    "hoarding rates Mumbai",
    "billboard rates Delhi",
    "bus stop advertising",
    "digital billboard India",
    "outdoor advertising agencies",
    "OOH advertising platform",
    "advertising hoardings near me",
    "outdoor media planning India",
  ],
  openGraph: {
    title: "Outdoor Advertising India | Book Hoardings, Billboards & Bus Shelters",
    description:
      "India's largest platform for outdoor advertising. Find and book hoardings, billboards, bus shelters across Mumbai, Delhi, Bangalore and more cities.",
    type: "website",
  },
}

export default function HomePage() {
  const cities = [
    { name: "Mumbai", count: "2,500+" },
    { name: "Delhi", count: "1,800+" },
    { name: "Bangalore", count: "1,200+" },
    { name: "Chennai", count: "900+" },
    { name: "Hyderabad", count: "800+" },
    { name: "Kolkata", count: "700+" },
    { name: "Pune", count: "600+" },
    { name: "Ahmedabad", count: "500+" },
  ]

  const adTypes = [
    {
      name: "Hoardings",
      description: "Large format outdoor advertising boards for maximum visibility",
      icon: "📋",
      locations: "Mumbai, Delhi, Bangalore",
    },
    {
      name: "Billboards",
      description: "Premium roadside advertising displays in high-traffic areas",
      icon: "🏢",
      locations: "All major cities",
    },
    {
      name: "Bus Shelters",
      description: "Transit advertising at bus stops and shelters",
      icon: "🚌",
      locations: "Mumbai, Delhi, Chennai",
    },
    {
      name: "Gantry Ads",
      description: "Overhead advertising structures on highways and main roads",
      icon: "🌉",
      locations: "Delhi, Mumbai, Bangalore",
    },
    {
      name: "Digital Displays",
      description: "LED and digital outdoor advertising screens",
      icon: "📺",
      locations: "Metro cities",
    },
    {
      name: "Mall Media",
      description: "Indoor and outdoor advertising in shopping malls",
      icon: "🏬",
      locations: "All cities",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">OOH India</span>
          </div>
          <Link href="/">
            <Button>Explore Map</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            India's Largest <span className="text-blue-600">Outdoor Advertising</span> Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover and book hoardings, billboards, bus shelters, gantry ads, and digital displays across Mumbai,
            Delhi, Bangalore, Chennai, Hyderabad, and 50+ cities in India. Plan your OOH media campaign with real-time
            availability and transparent pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="text-lg px-8 py-3">
                <Search className="w-5 h-5 mr-2" />
                Explore Advertising Locations
              </Button>
            </Link>
            <Link href="/?city=Mumbai">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View Mumbai Hoardings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our OOH Advertising Platform?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Real-Time Location Mapping</h3>
              <p className="text-gray-600">
                Interactive map showing exact locations of hoardings, billboards, and bus shelters across India with
                real-time availability status.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Transparent Pricing</h3>
              <p className="text-gray-600">
                Get instant pricing for outdoor advertising rates across different cities and media types. No hidden
                costs or lengthy negotiations.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Online Booking</h3>
              <p className="text-gray-600">
                Book your outdoor advertising campaigns online with instant confirmation. Manage multiple bookings from
                a single dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Outdoor Advertising Options Available</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose from various outdoor advertising formats to reach your target audience effectively across India's
            major cities.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{type.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                <p className="text-gray-600 mb-3">{type.description}</p>
                <Badge variant="secondary" className="text-xs">
                  Available in: {type.locations}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Outdoor Advertising Across Major Indian Cities
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Find hoardings, billboards, bus shelters, and gantry advertising opportunities in India's top metropolitan
            cities.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cities.map((city, index) => (
              <Link key={index} href={`/?city=${city.name}`}>
                <div className="bg-gray-50 rounded-lg p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{city.name}</h3>
                  <p className="text-blue-600 font-medium">{city.count} locations</p>
                  <p className="text-sm text-gray-500 mt-2">Hoardings • Billboards • Bus Shelters</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Advertising Locations</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Active Campaigns</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Outdoor Advertising in India: Complete Guide</h2>

          <div className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Hoarding Advertising in Mumbai</h3>
            <p className="text-gray-600 mb-6">
              Mumbai offers the highest concentration of premium hoarding advertising opportunities in India. From the
              bustling streets of Bandra-Kurla Complex to the commercial hubs of Lower Parel, outdoor advertising in
              Mumbai provides unmatched visibility. Our platform features over 2,500 hoarding locations across Mumbai,
              including prime spots on Western Express Highway, Eastern Express Highway, and major arterial roads.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Billboard Advertising in Delhi NCR</h3>
            <p className="text-gray-600 mb-6">
              Delhi's outdoor advertising landscape includes premium billboard locations across Connaught Place, Karol
              Bagh, Lajpat Nagar, and Gurgaon. With over 1,800 billboard advertising options, Delhi offers excellent
              reach for both B2B and B2C campaigns. Gantry advertising on Delhi's ring roads and metro corridors
              provides additional high-impact visibility.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Bus Shelter Advertising Across India</h3>
            <p className="text-gray-600 mb-6">
              Bus shelter advertising provides targeted reach at transit points across major cities. Our network
              includes bus stop advertising in Mumbai's BEST bus routes, Delhi's DTC network, Bangalore's BMTC stops,
              and Chennai's MTC bus shelters. This format offers excellent dwell time and repeated exposure to
              commuters.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Digital Outdoor Advertising</h3>
            <p className="text-gray-600 mb-6">
              Digital billboard advertising and LED displays are revolutionizing outdoor advertising in India. Available
              in metro cities like Mumbai, Delhi, Bangalore, Chennai, and Hyderabad, digital OOH provides dynamic
              content capabilities and real-time campaign updates. Perfect for time-sensitive promotions and brand
              campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Your Outdoor Advertising Campaign?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore thousands of hoarding, billboard, and bus shelter advertising opportunities across India. Get
            started with transparent pricing and instant booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="text-lg px-8 py-3">
                <MapPin className="w-5 h-5 mr-2" />
                Start Exploring Locations
              </Button>
            </Link>
            <Link href="/?type=Billboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                View All Billboards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">OOH India</span>
              </div>
              <p className="text-gray-400">
                India's largest outdoor advertising platform for hoardings, billboards, and bus shelters.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ad Types</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/?type=Billboard" className="hover:text-white">
                    Billboards
                  </Link>
                </li>
                <li>
                  <Link href="/?type=Digital Display" className="hover:text-white">
                    Digital Displays
                  </Link>
                </li>
                <li>
                  <Link href="/?type=Transit" className="hover:text-white">
                    Bus Shelters
                  </Link>
                </li>
                <li>
                  <Link href="/?type=Street Furniture" className="hover:text-white">
                    Gantry Ads
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Top Cities</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/?city=Mumbai" className="hover:text-white">
                    Mumbai Hoardings
                  </Link>
                </li>
                <li>
                  <Link href="/?city=Delhi" className="hover:text-white">
                    Delhi Billboards
                  </Link>
                </li>
                <li>
                  <Link href="/?city=Bangalore" className="hover:text-white">
                    Bangalore OOH
                  </Link>
                </li>
                <li>
                  <Link href="/?city=Chennai" className="hover:text-white">
                    Chennai Advertising
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OOH India. All rights reserved. | Outdoor Advertising Platform for India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
