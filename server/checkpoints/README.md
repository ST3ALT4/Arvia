# Drop your model checkpoint files here.
#
# Expected naming convention:
#
#   DL models (PyTorch):
#     {ModelName}_{horizon}d.pth
#     e.g.  LSTM_5d.pth
#           Transformer_TCN_20d.pth
#           TFT_60d.pth
#
#   Tree models (scikit-learn / pickle):
#     {ModelName}_{horizon}d.pkl
#     e.g.  XGBoost_5d.pkl
#           LightGBM_20d.pkl
#
# Available model names:
#   LSTM, GRU, LSTM_GRU, BiLSTM_Attention,
#   CNN_BiLSTM_Attention, Transformer_TCN, TFT,
#   XGBoost, LightGBM
#
# Available horizons: 5, 20, 60  (days)
