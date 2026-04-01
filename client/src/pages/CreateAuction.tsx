import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Plus, Eye, ChevronRight, ChevronLeft, Gavel } from 'lucide-react';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { auctionsAPI, uploadAPI, categoriesAPI } from '../api';
import { useToast } from '../contexts/ToastContext';

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair', 'For Parts'];
const DURATIONS = [
  { value: '1', label: '1 Day' },
  { value: '3', label: '3 Days' },
  { value: '5', label: '5 Days' },
  { value: '7', label: '7 Days' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
];

const STEPS = ['Details', 'Pricing', 'Images', 'Preview'];

const formatLKR = (n: number) => `LKR ${n.toLocaleString()}`;

const CreateAuction: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    title: '', description: '', category: '', condition: CONDITIONS[0],
    startingBid: '', reservePrice: '', duration: '7', location: 'Sri Lanka', tags: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  React.useEffect(() => {
    document.title = 'Create Listing — BidLanka';
    categoriesAPI.getAll().then(data => {
      setCategories(data);
      if (data.length > 0) {
        setForm(f => ({ ...f, category: data[0].name }));
      }
    }).catch(() => {});
  }, []);

  const validate = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.title.trim()) errs.title = 'Title is required';
      if (!form.description.trim()) errs.description = 'Description is required';
      if (form.description.length < 20) errs.description = 'Description must be at least 20 characters';
    }
    if (s === 1) {
      if (!form.startingBid || Number(form.startingBid) <= 0) errs.startingBid = 'Starting bid must be greater than 0';
      if (form.reservePrice && Number(form.reservePrice) <= Number(form.startingBid)) errs.reservePrice = 'Reserve price must be higher than starting bid';
    }
    if (s === 2 && imagePreviews.length === 0) errs.images = 'Please add at least one image';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) { addToast('warning', 'Max 5 images allowed'); return; }
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (i: number) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleNext = async () => {
    if (!validate(step)) return;
    if (step === 2 && imageFiles.length > 0 && uploadedUrls.length === 0) {
      setUploadingImages(true);
      try {
        const result = await uploadAPI.images(imageFiles);
        setUploadedUrls(result.urls);
      } catch {
        addToast('error', 'Image upload failed', 'Please try again');
        setUploadingImages(false);
        return;
      }
      setUploadingImages(false);
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const endTime = new Date();
      endTime.setDate(endTime.getDate() + Number(form.duration));

      const auctionData = {
        title: form.title, description: form.description, category: form.category,
        condition: form.condition, startingBid: Number(form.startingBid),
        reservePrice: form.reservePrice ? Number(form.reservePrice) : undefined,
        endTime: endTime.toISOString(), images: uploadedUrls,
        location: form.location, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      };

      const auction = await auctionsAPI.create(auctionData);
      addToast('success', '🎉 Auction published!', 'Your listing is now live');
      navigate(`/auctions/${auction._id}`);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create auction';
      addToast('error', 'Failed to publish', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-secondary mb-1">Create Auction Listing</h1>
        <p className="text-gray-400">Fill in the details to list your item</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-primary text-white' : i === step ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-gray-100 text-gray-400'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-primary' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="card p-6 md:p-8">
        {/* STEP 0: Details */}
        {step === 0 && (
          <div className="space-y-5 animate-fade-in">
            <Input id="auction-title" label="Item Title *" placeholder="e.g. Apple iPhone 14 Pro Max 256GB Space Black" value={form.title} onChange={e => set('title', e.target.value)} error={errors.title} />
            <Textarea id="auction-description" label="Description *" placeholder="Describe your item in detail — condition, features, what's included, why you're selling..." value={form.description} onChange={e => set('description', e.target.value)} error={errors.description} rows={6} />
            <div className="grid grid-cols-2 gap-4">
              <Select id="auction-category" label="Category *" value={form.category} onChange={e => set('category', e.target.value)} options={categories.map(c => ({ value: c.name, label: c.name }))} />
              <Select id="auction-condition" label="Condition *" value={form.condition} onChange={e => set('condition', e.target.value)} options={CONDITIONS.map(c => ({ value: c, label: c }))} />
            </div>
            <Input id="auction-location" label="Location" placeholder="Colombo, Sri Lanka" value={form.location} onChange={e => set('location', e.target.value)} />
            <Input id="auction-tags" label="Tags (comma separated)" placeholder="vintage, rare, limited edition" value={form.tags} onChange={e => set('tags', e.target.value)} helperText="Help buyers find your item" />
          </div>
        )}

        {/* STEP 1: Pricing */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              💡 Set a competitive starting bid to attract more bidders. You can also set a hidden reserve price.
            </div>
            <Input id="starting-bid" label="Starting Bid (LKR) *" type="number" placeholder="1000" min="1" value={form.startingBid} onChange={e => set('startingBid', e.target.value)} error={errors.startingBid} helperText="The minimum bid amount to start the auction" />
            <Input id="reserve-price" label="Reserve Price (LKR) — Optional" type="number" placeholder="Leave empty for no reserve" value={form.reservePrice} onChange={e => set('reservePrice', e.target.value)} error={errors.reservePrice} helperText="Hidden minimum price. Auction only completes if this is met." />
            <Select id="auction-duration" label="Auction Duration *" value={form.duration} onChange={e => set('duration', e.target.value)} options={DURATIONS} helperText="How long should your auction run?" />
          </div>
        ) as React.ReactNode}

        {/* STEP 2: Images */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${imagePreviews.length === 0 ? 'border-gray-300 hover:border-primary hover:bg-primary/5' : 'border-primary/30 bg-primary/5'}`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="font-semibold text-gray-700 mb-1">Click to upload images</p>
              <p className="text-sm text-gray-400">PNG, JPG, WEBP up to 5MB each (max 5 images)</p>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} id="image-upload" />
            </div>
            {errors.images && <p className="text-xs text-error">{errors.images}</p>}

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && <span className="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">Main</span>}
                    <button onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <button onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary flex items-center justify-center text-gray-400 hover:text-primary transition-all">
                    <Plus size={24} />
                  </button>
                )}
              </div>
            )}
          </div>
        ) as React.ReactNode}

        {/* STEP 3: Preview */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="font-bold text-lg text-secondary">Review Your Listing</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-5">
              {[
                { label: 'Title', value: form.title },
                { label: 'Category', value: form.category },
                { label: 'Condition', value: form.condition },
                { label: 'Starting Bid', value: formatLKR(Number(form.startingBid)) },
                { label: 'Reserve Price', value: form.reservePrice ? formatLKR(Number(form.reservePrice)) : 'None' },
                { label: 'Duration', value: `${form.duration} day${Number(form.duration) > 1 ? 's' : ''}` },
                { label: 'Location', value: form.location },
                { label: 'Images', value: `${imagePreviews.length} image${imagePreviews.length !== 1 ? 's' : ''}` },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-xs text-gray-400">{row.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {imagePreviews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                ))}
              </div>
            )}
            <p className="text-sm font-semibold text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded-xl">{form.description}</p>
          </div>
        ) as React.ReactNode}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0}>
            <ChevronLeft size={16} /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} isLoading={uploadingImages}>
              {uploadingImages ? 'Uploading...' : 'Continue'} <ChevronRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isLoading} className="gap-2">
              <Gavel size={18} /> Publish Auction
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;
