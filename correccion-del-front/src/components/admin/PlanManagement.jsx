import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Check } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    price_ars: 0,
    price_usd: 0,
    price_eur: 0,
    is_active: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .order('price_usd', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch membership plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('membership_plans')
        .update(formData)
        .eq('id', editingPlan.id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Plan updated successfully' });

      setIsDialogOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to update plan',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || '',
      price_ars: plan.price_ars || 0,
      price_usd: plan.price_usd || 0,
      price_eur: plan.price_eur || 0,
      is_active: plan.is_active !== false
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <span className={`inline-flex items-center px-2 py-1 mt-2 text-xs font-semibold rounded-full ${
                  plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Dialog open={isDialogOpen && editingPlan?.id === plan.id} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingPlan(null);
              }}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Plan</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Plan Name</Label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_ars">Price (ARS)</Label>
                      <input
                        id="price_ars"
                        type="number"
                        value={formData.price_ars}
                        onChange={(e) => setFormData({ ...formData, price_ars: parseFloat(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_usd">Price (USD)</Label>
                      <input
                        id="price_usd"
                        type="number"
                        value={formData.price_usd}
                        onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_eur">Price (EUR)</Label>
                      <input
                        id="price_eur"
                        type="number"
                        value={formData.price_eur}
                        onChange={(e) => setFormData({ ...formData, price_eur: parseFloat(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="is_active"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Update
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">${plan.price_ars}</span>
                <span className="text-gray-500">ARS/month</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-700">${plan.price_usd}</span>
                <span className="text-gray-500">USD/month</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-700">€{plan.price_eur}</span>
                <span className="text-gray-500">EUR/month</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {plan.features && Array.isArray(plan.features) && plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default PlanManagement;