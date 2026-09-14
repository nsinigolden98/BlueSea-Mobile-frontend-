import { useState, useEffect } from 'react';
import { Toast, Loader, EventDashboard } from '@/components/ui-custom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MapPin, Plus, Loader2, ChevronRight, X, Trash2, ArrowLeft, Check, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRequest, postRequest, postFileRequest, ENDPOINTS, API_BASE, type MarketplaceEvent, type CreateEventPayload, type VendorStatus } from '@/types';
import { useNavigate } from 'react-router-dom';

interface TicketTypeForm {
  name: string;
  price: string;
  quantity_available: string;
}

interface LocalCreateEventFormData extends Partial<CreateEventPayload> {
  event_mode?: 'offline' | 'online' | 'hybrid';
  meeting_link?: string;
}

const CATEGORIES = ['Music', 'Conference', 'Sports', 'Networking', 'Workshop', 'Party', 'Others'] as const;

const EVENT_MODES = [
  { value: 'offline', label: 'Offline', description: 'In-person physical event' },
  { value: 'online', label: 'Online', description: 'Virtual online event' },
  { value: 'hybrid', label: 'Hybrid', description: 'Both in-person and virtual' },
] as const;

export function EventManager() {
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState<MarketplaceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showModePicker, setShowModePicker] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { name: '', price: '', quantity_available: '' }
  ]);
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const { showToast, ToastComponent } = Toast();
  const { showLoader, hideLoader, LoaderComponent } = Loader();
  const [formData, setFormData] = useState<LocalCreateEventFormData>({
    event_title: '',
    event_description: '',
    event_date: '',
    event_mode: 'offline',
    event_location: '',
    meeting_link: '',
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
        setMyEvents(response.data || []);
      }
    } catch (err) {
      console.log(err);
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
      } else if (response) {
        setVendorStatus(response as VendorStatus);
      } else {
        setVendorStatus(null);
      }
    } catch (err) {
      console.log(err);
      setVendorStatus(null);
    }
  };

  const handleInputChange = (field: keyof LocalCreateEventFormData, value: string | boolean | File | undefined) => {
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

  const isValidMeetingLink = (link: string) => {
    if (!link || !link.trim()) return false;
    try {
      const formatted = link.startsWith('http://') || link.startsWith('https://') ? link : `https://${link}`;
      new URL(formatted);
      return true;
    } catch {
      return false;
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.event_title?.trim()) {
      showToast('Event title is required');
      return;
    }

    if (!formData.hosted_by?.trim()) {
      showToast('Hosted by is required');
      return;
    }

    if (!formData.category) {
      showToast('Please select an event category');
      return;
    }

    const currentMode = formData.event_mode || 'offline';

    if (currentMode === 'offline' || currentMode === 'hybrid') {
      if (!formData.event_location?.trim()) {
        showToast(currentMode === 'hybrid' ? 'Location and meeting link are required for hybrid events' : 'Location is required for offline events');
        return;
      }
    }

    if (currentMode === 'online' || currentMode === 'hybrid') {
      if (!formData.meeting_link?.trim()) {
        showToast(currentMode === 'hybrid' ? 'Location and meeting link are required for hybrid events' : 'Meeting link is required for online events');
        return;
      }
      if (!isValidMeetingLink(formData.meeting_link)) {
        showToast('Please enter a valid URL for the meeting link');
        return;
      }
    }

    if (!formData.event_date) {
      showToast('Event date is required');
      return;
    }

    if (!formData.event_banner) {
      showToast('Event banner image is required');
      return;
    }

    if (isFree) {
      const qty = Number(formData.quantity);
      if (!formData.quantity || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
        showToast('Please enter a valid participant quantity');
        return;
      }
    } else {
      if (ticketTypes.length === 0) {
        showToast('Please add at least one ticket type');
        return;
      }

      for (let i = 0; i < ticketTypes.length; i++) {
        const tt = ticketTypes[i];
        if (!tt.name.trim()) {
          showToast('Please complete all ticket information');
          return;
        }
        const priceNum = Number(tt.price);
        if (tt.price === '' || isNaN(priceNum) || priceNum < 0) {
          showToast('Please complete all ticket information');
          return;
        }
        const qtyNum = Number(tt.quantity_available);
        if (tt.quantity_available === '' || isNaN(qtyNum) || qtyNum <= 0 || !Number.isInteger(qtyNum)) {
          showToast('Please complete all ticket information');
          return;
        }
      }
    }

    try {
      showLoader();
      const vendorId = vendorStatus?.id || (vendorStatus as unknown as Record<string, string>)?.vendor_id;

      const formattedMeetingLink = formData.meeting_link?.trim()
        ? (formData.meeting_link.trim().startsWith('http://') || formData.meeting_link.trim().startsWith('https://')
            ? formData.meeting_link.trim()
            : `https://${formData.meeting_link.trim()}`)
        : undefined;

      const payload: Record<string, unknown> = {
        ...(vendorId ? { vendor: vendorId } : {}),
        event_title: formData.event_title.trim(),
        event_description: formData.event_description?.trim() || '',
        event_date: new Date(formData.event_date as string).toISOString(),
        event_mode: currentMode,
        hosted_by: formData.hosted_by.trim(),
        category: formData.category,
        is_free: isFree,
        quantity: isFree ? Number(formData.quantity) : undefined,
        ticket_types: isFree
          ? []
          : ticketTypes.map(tt => ({
              name: tt.name.trim(),
              price: Number(tt.price),
              quantity_available: Number(tt.quantity_available),
              initial_quantity: Number(tt.quantity_available),
            })),
      };

      if (currentMode === 'offline' || currentMode === 'hybrid') {
        payload.event_location = formData.event_location?.trim();
      }

      if (currentMode === 'online' || currentMode === 'hybrid') {
        payload.meeting_link = formattedMeetingLink;
      }

      const hasFiles = formData.event_banner || formData.ticket_image;

      if (hasFiles) {
        const formDataObj = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
              formDataObj.append(key, JSON.stringify(value));
            } else {
              formDataObj.append(key, String(value));
            }
          }
        });

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
          showToast(response?.error || response?.message || 'Failed to create event');
        }
      } else {
        const response = await postRequest(ENDPOINTS.create_events, payload);
        console.log('Create event response:', response);
        hideLoader();

        if (response?.id || response?.success) {
          showToast('Event created successfully!');
          setShowModal(false);
          fetchMyEvents();
          resetForm();
        } else {
          showToast(response?.error || response?.message || 'Failed to create event');
        }
      }
    } catch (err: unknown) {
      console.log(err);
      hideLoader();
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      showToast(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      event_title: '',
      event_description: '',
      event_date: '',
      event_mode: 'offline',
      event_location: '',
      meeting_link: '',
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
    return `https://blueseamobile.com.ng/event/${event.id}`;
  };

  const handleCopyLink = (e: React.MouseEvent, event: MarketplaceEvent) => {
    e.stopPropagation();
    const link = getEventLink(event);
    navigator.clipboard.writeText(link)
      .then(() => showToast('Link copied to clipboard'))
      .catch(() => showToast('Failed to copy link'));
  };

  const currentMode = formData.event_mode || 'offline';

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
                                {event.event_location || 'Online'}
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
                            <Link className="w-3.5 h-3.5 mr-1.5" />
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
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
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
                <Label>Category *</Label>
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-slate-800 dark:text-white font-medium">
                    {formData.category || 'Select Category'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2">
                <Label>Event Mode *</Label>
                <button
                  type="button"
                  onClick={() => setShowModePicker(true)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="text-slate-800 dark:text-white font-medium">
                    {EVENT_MODES.find(m => m.value === currentMode)?.label || 'Offline'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {(currentMode === 'offline' || currentMode === 'hybrid') && (
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Input
                    value={formData.event_location}
                    onChange={(e) => handleInputChange('event_location', e.target.value)}
                    placeholder="Enter physical venue or address"
                  />
                </div>
              )}

              {(currentMode === 'online' || currentMode === 'hybrid') && (
                <div className="space-y-2">
                  <Label>Meeting Link *</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="url"
                      value={formData.meeting_link || ''}
                      onChange={(e) => handleInputChange('meeting_link', e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Banner *</Label>
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
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Name *</Label>
                          <Input
                            placeholder="Regular"
                            value={ticket.name}
                            onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price (₦) *</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(index, 'price', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity *</Label>
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

      {showCategoryPicker && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">Select Category</h3>
              <button 
                type="button"
                onClick={() => setShowCategoryPicker(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    handleInputChange('category', cat);
                    setShowCategoryPicker(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors",
                    formData.category === cat
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <span>{cat}</span>
                  {formData.category === cat && <Check className="w-4 h-4 text-sky-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showModePicker && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-semibold text-slate-800 dark:text-white">Select Event Mode</h3>
              <button 
                type="button"
                onClick={() => setShowModePicker(false)} 
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1">
              {EVENT_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    handleInputChange('event_mode', mode.value);
                    setShowModePicker(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between transition-colors",
                    currentMode === mode.value
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <div>
                    <div className="text-slate-800 dark:text-white">{mode.label}</div>
                    <div className="text-xs text-slate-400 font-normal">{mode.description}</div>
                  </div>
                  {currentMode === mode.value && <Check className="w-4 h-4 text-sky-500" />}
                </button>
              ))}
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