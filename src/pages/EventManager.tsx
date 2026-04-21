import { useState, useEffect } from 'react';
import { Toast, Loader, EventDashboard } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Plus, Loader2, ChevronRight, X, Trash2, ArrowLeft} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, postRequest, postFileRequest, ENDPOINTS, API_BASE, type MarketplaceEvent, type CreateEventPayload, type VendorStatus } from '@/types';
import { useNavigate } from 'react-router-dom';

interface TicketTypeForm {
  name: string;
  price: string;
  quantity_available: string;
}

const CATEGORIES = ['Music', 'Conference', 'Sports', 'Networking', 'Workshop', 'Party', 'Others'];


export function EventManager() {
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState<MarketplaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: '', price: '', quantity_available: '' }
  ]);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  void vendorStatus; // Keep for future use
  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const [formData, setFormData] = useState<Partial<CreateEventPayload>>({
    event_title: '',
    event_description: '',
    event_date: '',
    event_location: '',
    hosted_by: '',
    category: 'Music',
    is_free: true,
    quantity: undefined,
  });
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const [ticketImagePreview, setTicketImagePreview] = useState<string>('');

  const [selectedEventForDashboard, setSelectedEventForDashboard] = useState<MarketplaceEvent | null>(null);

  const openEventDashboard = (event: MarketplaceEvent) => {
    setSelectedEventForDashboard(event);
  };

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path}`;
  };

  const getEventImage = (event: MarketplaceEvent) => {
    if (event.event_banner) return getImageUrl(event.event_banner);
    if (event.ticket_image) return getImageUrl(event.ticket_image);
    return '';
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleInputChange('event_banner', file);
    }
  };

  const handleTicketImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTicketImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      handleInputChange('ticket_image', file);
    }
  };

  useEffect(() => {
    fetchMyEvents();
    fetchVendorStatus();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await getRequest(ENDPOINTS.vendor_tickets);
      if (response) {
        console.log(response)
        setMyEvents(response.data);
      }
    } catch (err) {
      console.log(err)
      showToast('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorStatus = async () => {
    try {
      const response = await getRequest(ENDPOINTS.vendor_status);
      if (response?.vendor) {
        setVendorStatus(response.vendor);
      } else {
        setVendorStatus(null);
      }
    } catch (err) {
      console.log(err)
      setVendorStatus(null);
    }
  };

  const handleInputChange = (field: keyof CreateEventPayload, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '', quantity_available: '' }]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index: number, field: keyof TicketTypeForm, value: string) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const handleCreateEvent = async () => {
    if (!formData.event_title || !formData.event_date || !formData.event_location) {
      showToast('Please fill in all required fields');
      return;
    }

    if (isFree && !formData.quantity) {
      showToast('Please enter the number of participants for free events');
      return;
    }

    if (!isFree && ticketTypes.length === 0) {
      showToast('Please add at least one ticket type');
      return;
    }

    try {
      showLoader();
      const payload = {
        ...formData,
        quantity: isFree ? Number(formData.quantity) : undefined,
        event_date: new Date(formData.event_date as string).toISOString(),
        ticket_types: isFree ? [] : ticketTypes.map(tt => ({
          name: tt.name,
          price: Number(tt.price) || 0,
          quantity_available: Number(tt.quantity_available) || 0,
          initial_quantity: Number(tt.quantity_available) || 0,
        })),
      };
      // console.log(payload)
      // Check if we have files to upload
      const hasFiles = formData.event_banner || formData.ticket_image;

      if (hasFiles) {
        // Use FormData for file uploads
        const formDataObj = new FormData();
        
        // Add regular fields
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'event_banner' && key !== 'ticket_image') {
            if (typeof value === 'object' && !Array.isArray(value)) {
              formDataObj.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
              formDataObj.append(key, JSON.stringify(value));
            } else {
              formDataObj.append(key, String(value));
            }
          }
        });

        // Add files
        if (formData.event_banner) {
          formDataObj.append('event_banner', formData.event_banner as File);
        }
        if (formData.ticket_image) {
          formDataObj.append('ticket_image', formData.ticket_image as File);
        }

        const response = await postFileRequest(ENDPOINTS.create_events, formDataObj);
        console.log('Create event response:', response);
        hideLoader();
        
        if (response?.id || response?.success) {
          showToast('Event created successfully!');
          setShowModal(false);
          fetchMyEvents();
          resetForm();
        } else {
          showToast(response?.error || 'Failed to create event');
        }
      } else {
        const response = await postRequest(ENDPOINTS.create_events, payload);
        console.log('Create event response:', response);
        hideLoader();
        
        if (response?.state || response?.success) {
          showToast('Event created successfully!');
          setShowModal(false);
          fetchMyEvents();
          resetForm();
        } else {
          showToast(response?.error || 'Failed to create event');
        }
      }
    } catch (err) {
      console.log(err)
      hideLoader();
      showToast('Failed to create event');
    }
  };

  const resetForm = () => {
    setFormData({
      event_title: '',
      event_description: '',
      event_date: '',
      event_location: '',
      hosted_by: '',
      category: 'Music',
      is_free: true,
      quantity: undefined,
    });
    setTicketTypes([{ name: '', price: '', quantity_available: '' }]);
    setIsFree(true);
    setBannerPreview('');
    setTicketImagePreview('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventLink = (event: MarketplaceEvent) => {
    const slug = event.event_title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `https://blueseamobile.com.ng/event/${slug}/${event.id}`;
  };

  const handleCopyLink = (e: React.MouseEvent, event: MarketplaceEvent) => {
    e.stopPropagation();
    const link = getEventLink(event);
    navigator.clipboard.writeText(link)
      .then(() => showToast('Link copied to clipboard'))
      .catch(() => showToast('Failed to copy link'));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center px-4 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => navigate('/marketplace')}
            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="ml-2">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Event Manager</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your events</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">My Events</h2>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-sky-500 hover:bg-sky-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              </div>
            ) : myEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  No Events Yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Create your first event to start selling tickets
                </p>
                <Button 
                  onClick={() => setShowModal(true)}
                  className="bg-sky-500 hover:bg-sky-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myEvents.map((event) => (
                  <div 
                    key={event.id}
                    onClick={() => openEventDashboard(event)}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden">
                        {event.event_banner ? (
                          <img src={getEventImage(event)} alt={event.event_title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                              {event.event_title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(event.event_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.event_location}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            event.is_approved 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          )}>
                            {event.is_approved ? 'Approved' : 'Pending'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {event.tickets_sold}/{event.total_tickets} sold
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            readOnly
                            value={getEventLink(event)}
                            className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 text-xs font-medium shrink-0"
                            onClick={(e) => handleCopyLink(e, event)}
                          >
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-h-[90vh] overflow-y-auto max-w-2xl">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Create Event</h2>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Event Title *</Label>
                <Input
                  value={formData.event_title}
                  onChange={(e) => handleInputChange('event_title', e.target.value)}
                  placeholder="Enter event title"
                />
              </div>

              <div className="space-y-2">
                <Label>Hosted By *</Label>
                <Input
                  value={formData.hosted_by}
                  onChange={(e) => handleInputChange('hosted_by', e.target.value)}
                  placeholder="Enter host name"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleInputChange('category', cat)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium transition-all",
                        formData.category === cat
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location *</Label>
                <Input
                  value={formData.event_location}
                  onChange={(e) => handleInputChange('event_location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Banner</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-slate-400">No image</span>
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ticket Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {ticketImagePreview ? (
                      <img src={ticketImagePreview} alt="Ticket image preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-slate-400">No image</span>
                      </div>
                    )}
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleTicketImageChange}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ticket Type</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      checked={isFree}
                      onChange={() => {
                        setIsFree(true);
                        handleInputChange('is_free', true);
                      }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">Free</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceType"
                      checked={!isFree}
                      onChange={() => {
                        setIsFree(false);
                        handleInputChange('is_free', false);
                      }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">Paid</span>
                  </label>
                </div>
              </div>

              {isFree ? (
                <div className="space-y-2">
                  <Label>Total Participants *</Label>
                  <Input
                    type="number"
                    value={formData.quantity || ''}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter max number of participants"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ticket Types</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTicketType}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Type
                    </Button>
                  </div>
                  
                  {ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 relative">
                      {ticketTypes.length > 1 && (
                        <button
                          onClick={() => removeTicketType(index)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            placeholder="Regular"
                            value={ticket.name}
                            onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price (₦)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            value={ticket.quantity_available}
                            onChange={(e) => updateTicketType(index, 'quantity_available', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.event_description}
                  onChange={(e) => handleInputChange('event_description', e.target.value)}
                  placeholder="Tell us more about the event"
                  className="h-32"
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleCreateEvent}
                  className="w-full bg-sky-500 hover:bg-sky-600"
                >
                  Create Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEventForDashboard && (
        <EventDashboard 
          event={selectedEventForDashboard} 
          onClose={() => setSelectedEventForDashboard(null)} 
        />
      )}

      <ToastComponent />
      <LoaderComponent />
    </div>
  );
}
